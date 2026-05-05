const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());

const db = new sqlite3.Database("iot.db");

// ambil 100 data terakhir
app.get("/data", (req, res) => {
  db.all(
    "SELECT * FROM iot_data ORDER BY id DESC LIMIT 100",
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows.reverse()); // biar urutan waktu normal
    }
  );
});

// optional: statistik sederhana
app.get("/stats", (req, res) => {
  db.get(
    "SELECT AVG(temperature) as avgTemp, AVG(humidity) as avgHum FROM iot_data",
    (err, row) => {
      res.json(row);
    }
  );
});

app.listen(3000, () => {
  console.log("🚀 API running http://localhost:3000");
});