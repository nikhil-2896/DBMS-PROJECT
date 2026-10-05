require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ================= ANALYTICS =================
app.get('/analytics/piechart', (req, res) => {
  const sql = `
    SELECT d.type AS disaster_type, COUNT(va.victim_id) AS total_victims
    FROM disaster d
    LEFT JOIN VICTIM_ASSISTANCE va ON d.disaster_id = va.disaster_id
    GROUP BY d.disaster_id, d.type
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ================= DISASTERS =================
app.get('/disasters', (req, res) => {
  db.query('SELECT disaster_id, type, severity FROM disaster ORDER BY disaster_id ASC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/disasters', (req, res) => {
  const { disaster_id, type, severity } = req.body;
  if (!disaster_id || !type || !severity) {
    return res.status(400).json({ error: 'All fields (disaster_id, type, severity) are required.' });
  }

  const sql = 'INSERT INTO disaster (disaster_id, type, severity) VALUES (?, ?, ?)';
  db.query(sql, [disaster_id, type, severity], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Disaster added successfully!' });
  });
});

// ================= VICTIMS =================
app.get('/victims', (req, res) => {
  db.query('SELECT victim_id, name FROM victim ORDER BY victim_id ASC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

const handleAddVictim = (req, res) => {
  const { victim_id, name } = req.body;
  if (!victim_id || !name) {
    return res.status(400).json({ error: 'Both victim_id and name are required.' });
  }

  const sql = 'INSERT INTO victim (victim_id, name) VALUES (?, ?)';
  db.query(sql, [victim_id, name], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Victim added successfully!' });
  });
};

app.post('/victim', handleAddVictim);
app.post('/victims', handleAddVictim);

// ================= SHELTERS =================
app.get('/shelters', (req, res) => {
  db.query('SELECT shelter_id, name, capacity, occupancy FROM shelter ORDER BY shelter_id ASC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ================= ASSIGNMENTS =================
app.get('/assignments', (req, res) => {
  const sql = `
    SELECT va.assistance_id, v.name AS victim_name, d.type AS disaster_type, s.name AS shelter_name, va.status
    FROM VICTIM_ASSISTANCE va
    JOIN victim v ON va.victim_id = v.victim_id
    JOIN disaster d ON va.disaster_id = d.disaster_id
    JOIN shelter s ON va.shelter_id = s.shelter_id
    ORDER BY va.assistance_id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/assign', (req, res) => {
  const { victim_id, disaster_id, shelter_id } = req.body;
  if (!victim_id || !disaster_id || !shelter_id) {
    return res.status(400).json({ error: 'Victim, Disaster, and Shelter are all required.' });
  }

  // Obtain next assistance_id to prevent collision
  const idSql = 'SELECT IFNULL(MAX(assistance_id), 400) + 1 AS next_id FROM VICTIM_ASSISTANCE';
  db.query(idSql, (idErr, idResults) => {
    if (idErr) return res.status(500).json({ error: idErr.message });

    const assistance_id = idResults[0].next_id;
    const insertSql = 'INSERT INTO VICTIM_ASSISTANCE (assistance_id, victim_id, disaster_id, shelter_id, status) VALUES (?, ?, ?, ?, ?)';
    
    db.query(insertSql, [assistance_id, victim_id, disaster_id, shelter_id, 'Assigned'], (err) => {
      if (err) {
        console.error("Assignment Error:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Assigned successfully!' });
    });
  });
});

// Root fallback to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});