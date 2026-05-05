# 🚀 IoT Dataset Generator

A synthetic data generator for IoT sensor simulation (temperature, humidity, motion) with realistic patterns, noise, and anomaly injection.

---

## 🌐 Live Demo

👉 https://maulina2705.github.io/iot-dataset-generator/

---

## 🎯 Project Goals

* Simulate realistic IoT sensor data
* Generate time-series dataset
* Inject anomalies (for ML use cases)
* Support multiple virtual devices

---

## 📊 Example Output

```json
{
  "device_id": "esp32_01",
  "timestamp": "2026-01-01 10:00:00",
  "temperature": 29.3,
  "humidity": 65,
  "motion": 0
}
```

---

## 🧠 Features

* Time-series data generation
* Daily pattern simulation (sinusoidal)
* Random noise injection
* Anomaly simulation (spikes, drops)
* Multi-device support

---

## ⚙️ Tech Stack

* Python (NumPy, Pandas)
* JavaScript (for web demo - upcoming)

---

## 📂 Project Structure

```
iot-dataset-generator/
│
├── python_version/
├── docs/
├── data/
└── README.md
```

---

## 🚀 How to Run (Python)

```bash
pip install -r requirements.txt
python python_version/generator.py
```

---

## 🔜 Roadmap

* [ ] Build Python generator
* [ ] Add anomaly injection
* [ ] Create web demo (GitHub Pages)
* [ ] Add dataset download (CSV/JSON)
* [ ] Integrate with ML pipeline

---

## 💡 Use Cases

* Machine Learning training (anomaly detection)
* IoT system simulation
* Data engineering pipeline testing

---
