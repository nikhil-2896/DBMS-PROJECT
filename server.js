require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

const SEVERITIES = ['High', 'Medium', 'Low'];
const ASSIGNMENT_STATUSES = ['Assigned', 'Rescued', 'Under Treatment', 'Relocated'];
const ALLOCATION_STATUSES = ['Pending', 'Distributed'];

app.use(cors());
app.use(express.json());

// ================= HELPERS =================
const toId = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const sendDbError = (res, err, messages = {}) => {
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: messages.duplicate || 'Record already exists.' });
  }
  if (err.sqlState === '45000') {
    return res.status(409).json({ error: err.sqlMessage });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: 'Referenced record does not exist.' });
  }
  console.error('Database error:', err);
  return res.status(500).json({ error: 'Internal server error.' });
};

// ================= STATIC (legacy frontend) =================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'style.css'));
});

// ================= ANALYTICS =================
app.get('/analytics/piechart', (req, res) => {
  const sql = `
    SELECT d.type AS disaster_type, COUNT(va.victim_id) AS total_victims
    FROM disaster d
    LEFT JOIN victim_assistance va ON d.disaster_id = va.disaster_id
    GROUP BY d.disaster_id, d.type
  `;

  db.query(sql, (err, results) => {
    if (err) return sendDbError(res, err);
    res.json(results);
  });
});

app.get('/analytics/costs', (req, res) => {
  const sql = `
    SELECT
      d.disaster_id,
      d.type AS disaster_type,
      CAST(COALESCE(SUM(ra.qty * r.unit_cost), 0) AS UNSIGNED) AS total_cost
    FROM disaster d
    LEFT JOIN resource_alloc ra ON d.disaster_id = ra.disaster_id
    LEFT JOIN resource r ON ra.resource_id = r.resource_id
    GROUP BY d.disaster_id, d.type
    ORDER BY total_cost DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return sendDbError(res, err);
    res.json(results);
  });
});

// ================= DISASTERS =================
app.get('/disasters', (req, res) => {
  db.query('SELECT disaster_id, type, severity FROM disaster ORDER BY disaster_id ASC', (err, results) => {
    if (err) return sendDbError(res, err);
    res.json(results);
  });
});

app.post('/disasters', (req, res) => {
  const disasterId = toId(req.body.disaster_id);
  const type = typeof req.body.type === 'string' ? req.body.type.trim() : '';
  const severity = req.body.severity;

  if (!disasterId || !type || !severity) {
    return res.status(400).json({ error: 'All fields (disaster_id, type, severity) are required.' });
  }
  if (type.length > 50) {
    return res.status(400).json({ error: 'Type must be 50 characters or fewer.' });
  }
  if (!SEVERITIES.includes(severity)) {
    return res.status(400).json({ error: 'Severity must be High, Medium, or Low.' });
  }

  const sql = 'INSERT INTO disaster (disaster_id, type, severity) VALUES (?, ?, ?)';
  db.query(sql, [disasterId, type, severity], (err) => {
    if (err) return sendDbError(res, err, { duplicate: 'A disaster with this ID already exists.' });
    res.status(201).json({ message: 'Disaster added successfully!' });
  });
});

// ================= VICTIMS =================
app.get('/victims', (req, res) => {
  db.query('SELECT victim_id, name FROM victim ORDER BY victim_id ASC', (err, results) => {
    if (err) return sendDbError(res, err);
    res.json(results);
  });
});

const handleAddVictim = (req, res) => {
  const victimId = toId(req.body.victim_id);
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';

  if (!victimId || !name) {
    return res.status(400).json({ error: 'Both victim_id and name are required.' });
  }
  if (name.length > 50) {
    return res.status(400).json({ error: 'Name must be 50 characters or fewer.' });
  }

  const sql = 'INSERT INTO victim (victim_id, name) VALUES (?, ?)';
  db.query(sql, [victimId, name], (err) => {
    if (err) return sendDbError(res, err, { duplicate: 'A victim with this ID already exists.' });
    res.status(201).json({ message: 'Victim added successfully!' });
  });
};

app.post('/victim', handleAddVictim);
app.post('/victims', handleAddVictim);

// ================= SHELTERS =================
app.get('/shelters', (req, res) => {
  db.query('SELECT shelter_id, name, capacity, occupancy FROM shelter ORDER BY shelter_id ASC', (err, results) => {
    if (err) return sendDbError(res, err);
    res.json(results);
  });
});

app.get('/shelters/suggestion', (req, res) => {
  const disasterId = toId(req.query.disaster_id);
  if (!disasterId) {
    return res.status(400).json({ error: 'A valid disaster_id is required.' });
  }

  const sql = `
    SELECT
      s.shelter_id,
      s.name,
      s.capacity,
      s.occupancy,
      (s.capacity - s.occupancy) AS free_beds,
      EXISTS (
        SELECT 1
        FROM disaster_location dl
        WHERE dl.disaster_id = ? AND dl.location_id = s.location_id
      ) AS in_affected_area
    FROM shelter s
    WHERE s.occupancy < s.capacity
    ORDER BY in_affected_area DESC, free_beds DESC
    LIMIT 1
  `;

  db.query(sql, [disasterId], (err, results) => {
    if (err) return sendDbError(res, err);
    res.json(results[0] || null);
  });
});

// ================= ASSIGNMENTS =================
app.get('/assignments', (req, res) => {
  const sql = `
    SELECT va.assistance_id, v.name AS victim_name, d.type AS disaster_type, s.name AS shelter_name, va.status
    FROM victim_assistance va
    JOIN victim v ON va.victim_id = v.victim_id
    JOIN disaster d ON va.disaster_id = d.disaster_id
    JOIN shelter s ON va.shelter_id = s.shelter_id
    ORDER BY va.assistance_id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return sendDbError(res, err);
    res.json(results);
  });
});

app.post('/assign', (req, res) => {
  const victimId = toId(req.body.victim_id);
  const disasterId = toId(req.body.disaster_id);
  const shelterId = toId(req.body.shelter_id);

  if (!victimId || !disasterId || !shelterId) {
    return res.status(400).json({ error: 'Victim, Disaster, and Shelter are all required.' });
  }

  const sql = 'INSERT INTO victim_assistance (victim_id, disaster_id, shelter_id, status) VALUES (?, ?, ?, ?)';
  db.query(sql, [victimId, disasterId, shelterId, 'Assigned'], (err, result) => {
    if (err) {
      return sendDbError(res, err, { duplicate: 'This victim is already assigned for this disaster.' });
    }
    res.status(201).json({ message: 'Assigned successfully!', assistance_id: result.insertId });
  });
});

app.patch('/assignments/:id', (req, res) => {
  const assistanceId = toId(req.params.id);
  const status = req.body.status;

  if (!assistanceId) {
    return res.status(400).json({ error: 'A valid assignment ID is required.' });
  }
  if (!ASSIGNMENT_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${ASSIGNMENT_STATUSES.join(', ')}.` });
  }

  const sql = 'UPDATE victim_assistance SET status = ? WHERE assistance_id = ?';
  db.query(sql, [status, assistanceId], (err, result) => {
    if (err) return sendDbError(res, err);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }
    res.json({ message: 'Status updated successfully!' });
  });
});

app.delete('/assignments/:id', (req, res) => {
  const assistanceId = toId(req.params.id);

  if (!assistanceId) {
    return res.status(400).json({ error: 'A valid assignment ID is required.' });
  }

  db.query('DELETE FROM victim_assistance WHERE assistance_id = ?', [assistanceId], (err, result) => {
    if (err) return sendDbError(res, err);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }
    res.json({ message: 'Victim unassigned successfully!' });
  });
});

// ================= RESOURCES =================
app.get('/resources', (req, res) => {
  db.query('SELECT resource_id, name, category, unit_cost FROM resource ORDER BY resource_id ASC', (err, results) => {
    if (err) return sendDbError(res, err);
    res.json(results);
  });
});

app.get('/resource-allocations', (req, res) => {
  const sql = `
    SELECT
      ra.alloc_id,
      d.type AS disaster_type,
      r.name AS resource_name,
      r.category,
      ra.qty,
      r.unit_cost,
      (ra.qty * r.unit_cost) AS total_cost,
      ra.status
    FROM resource_alloc ra
    JOIN disaster d ON ra.disaster_id = d.disaster_id
    JOIN resource r ON ra.resource_id = r.resource_id
    ORDER BY ra.alloc_id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return sendDbError(res, err);
    res.json(results);
  });
});

app.post('/resource-allocations', (req, res) => {
  const disasterId = toId(req.body.disaster_id);
  const resourceId = toId(req.body.resource_id);
  const qty = toId(req.body.qty);

  if (!disasterId || !resourceId || !qty) {
    return res.status(400).json({ error: 'Disaster, resource, and a quantity above zero are required.' });
  }

  const sql = 'INSERT INTO resource_alloc (disaster_id, resource_id, qty, status) VALUES (?, ?, ?, ?)';
  db.query(sql, [disasterId, resourceId, qty, 'Pending'], (err, result) => {
    if (err) return sendDbError(res, err);
    res.status(201).json({ message: 'Resource allocated successfully!', alloc_id: result.insertId });
  });
});

app.patch('/resource-allocations/:id', (req, res) => {
  const allocId = toId(req.params.id);
  const status = req.body.status;

  if (!allocId) {
    return res.status(400).json({ error: 'A valid allocation ID is required.' });
  }
  if (!ALLOCATION_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${ALLOCATION_STATUSES.join(', ')}.` });
  }

  db.query('UPDATE resource_alloc SET status = ? WHERE alloc_id = ?', [status, allocId], (err, result) => {
    if (err) return sendDbError(res, err);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Allocation not found.' });
    }
    res.json({ message: 'Status updated successfully!' });
  });
});

// ================= RESPONDERS =================
app.get('/responders', (req, res) => {
  const sql = `
    SELECT rs.responder_id, rs.name, rs.role, rs.org, d.type AS disaster_type
    FROM responder rs
    LEFT JOIN disaster d ON rs.disaster_id = d.disaster_id
    ORDER BY rs.responder_id ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return sendDbError(res, err);
    res.json(results);
  });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});