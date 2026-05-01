
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ================= DATABASE CONNECTION =================
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: 'Yash@9756', // <--- UPDATE THIS TO YOUR MYSQL PASSWORD
  database: 'disaster_management'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL Database.');
});

// ================= ANALYTICS (NEW) =================
app.get('/analytics/piechart', (req, res) => {
  const sql = `
    SELECT d.type AS disaster_type, COUNT(va.victim_id) AS total_victims
    FROM disaster d
    LEFT JOIN VICTIM_ASSISTANCE va ON d.disaster_id = va.disaster_id
    GROUP BY d.type
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ================= DISASTERS =================
app.get('/disasters', (req, res) => {
  db.query('SELECT disaster_id, type, severity FROM disaster', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/disasters', (req, res) => {
  const { disaster_id, type, severity } = req.body;
  const sql = 'INSERT INTO disaster (disaster_id, type, severity) VALUES (?, ?, ?)';
  db.query(sql, [disaster_id, type, severity], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Disaster added successfully!' });
  });
});

// ================= VICTIMS =================
app.get('/victims', (req, res) => {
  db.query('SELECT victim_id, name FROM victim', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/victim', (req, res) => {
  const { victim_id, name } = req.body;
  const sql = 'INSERT INTO victim (victim_id, name) VALUES (?, ?)';
  db.query(sql, [victim_id, name], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Victim added successfully!' });
  });
});

// ================= SHELTERS =================
app.get('/shelters', (req, res) => {
  db.query('SELECT shelter_id, name, capacity, occupancy FROM shelter', (err, results) => {
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
  const assistance_id = Math.floor(Math.random() * 1000000) + 1000; 
  
  const sql = 'INSERT INTO VICTIM_ASSISTANCE (assistance_id, victim_id, disaster_id, shelter_id, status) VALUES (?, ?, ?, ?, ?)';
  
  db.query(sql, [assistance_id, victim_id, disaster_id, shelter_id, 'Assigned'], (err, result) => {
    if (err) {
        console.error("Assignment Error:", err.message);
        return res.status(500).json({ error: "Failed to assign. " + err.message });
    }
    res.json({ message: 'Assigned successfully!' });
  });
});

// ================= INIT =================
app.listen(3000, () => {
  console.log('Server running on port 3000');
});