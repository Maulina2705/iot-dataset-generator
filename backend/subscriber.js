const mqtt = require("mqtt");
const sqlite3 = require("sqlite3").verbose();

// =======================
// CONNECT DB
// =======================
const db = new sqlite3.Database("iot.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS iot_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT,
      temperature REAL,
      humidity REAL,
      light REAL,
      occupancy INTEGER,
      fan_power REAL,
      lamp_power REAL,
      charger_power REAL,
      total_power REAL
    )
  `);
});

// =======================
// MQTT CONNECT
// =======================
const client = mqtt.connect("mqtt://broker.hivemq.com");

client.on("connect", () => {
  console.log("✅ Connected to MQTT");
  client.subscribe("iot/smartroom/data");
});

// =======================
// RECEIVE DATA
// =======================
client.on("message", (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    console.log("📡 Incoming:", data.temperature);

    db.run(
      `INSERT INTO iot_data 
      (timestamp, temperature, humidity, light, occupancy, fan_power, lamp_power, charger_power, total_power)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.timestamp,
        data.temperature,
        data.humidity,
        data.light,
        data.occupancy,
        data.fan_power,
        data.lamp_power,
        data.charger_power,
        data.total_power
      ]
    );

  } catch (err) {
    console.error("Error:", err);
  }
});
