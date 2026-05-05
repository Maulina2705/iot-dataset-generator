let generatedData = [];
let chart;

// =======================
// CONFIG FROM UI
// =======================

function getConfig() {
  return {
    dataCount: parseInt(document.getElementById("dataCount").value),
    deviceCount: parseInt(document.getElementById("deviceCount").value),
    anomalyEnabled: document.getElementById("anomalyToggle").checked
  };
}

// =======================
// SENSOR GENERATORS
// =======================

function generateTemperature(i, anomalyEnabled) {
  let base = 25 + 5 * Math.sin(2 * Math.PI * i / 24);
  let noise = (Math.random() - 0.5);
  let value = base + noise;

  // injected anomaly (simulasi dunia nyata)
  if (anomalyEnabled && Math.random() < 0.02) {
    value += Math.random() * 20;
  }

  return parseFloat(value.toFixed(2));
}

function generateHumidity(i, anomalyEnabled) {
  let base = 70 - 10 * Math.sin(2 * Math.PI * i / 24);
  let noise = (Math.random() * 4 - 2);
  let value = base + noise;

  if (anomalyEnabled && Math.random() < 0.02) {
    value += (Math.random() * 40 - 20);
  }

  return parseFloat(value.toFixed(2));
}

function generateMotion() {
  return Math.random() < 0.1 ? 1 : 0;
}

// =======================
// ANOMALY DETECTION (Z-SCORE)
// =======================

function detectAnomalies(data, threshold = 2.8) {
  const temps = data.map(d => d.temperature);

  const mean = temps.reduce((a, b) => a + b, 0) / temps.length;

  const variance = temps.reduce((sum, val) => {
    return sum + Math.pow(val - mean, 2);
  }, 0) / temps.length;

  const std = Math.sqrt(variance);

  return data.map(d => {
    const z = (d.temperature - mean) / std;
    return {
      ...d,
      is_anomaly: Math.abs(z) > threshold
    };
  });
}

// =======================
// MAIN GENERATOR
// =======================

function generateData() {
  let config = getConfig();
  let data = [];

  for (let i = 0; i < config.dataCount; i++) {
    data.push({
      device_id: "esp32_" + Math.floor(Math.random() * config.deviceCount + 1),
      timestamp: new Date(Date.now() + i * 60000).toISOString(),
      temperature: generateTemperature(i, config.anomalyEnabled),
      humidity: generateHumidity(i, config.anomalyEnabled),
      motion: generateMotion()
    });
  }

  // tambahkan hasil deteksi anomaly
  data = detectAnomalies(data);

  generatedData = data;

  document.getElementById("output").textContent =
    JSON.stringify(data, null, 2);

  drawChart(data);
}

// =======================
// DOWNLOAD FUNCTIONS
// =======================

function downloadJSON() {
  if (generatedData.length === 0) return alert("Generate data first!");

  let blob = new Blob([JSON.stringify(generatedData, null, 2)], {
    type: "application/json"
  });

  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "iot_data.json";
  link.click();
}

function downloadCSV() {
  if (generatedData.length === 0) return alert("Generate data first!");

  let csv = "device_id,timestamp,temperature,humidity,motion,is_anomaly\n";

  generatedData.forEach(row => {
    csv += `${row.device_id},${row.timestamp},${row.temperature},${row.humidity},${row.motion},${row.is_anomaly}\n`;
  });

  let blob = new Blob([csv], { type: "text/csv" });

  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "iot_data.csv";
  link.click();
}

// =======================
// CHART WITH ANOMALY
// =======================

function drawChart(data) {
  const labels = data.map((_, i) => i);

  const normalData = data.map(d => d.is_anomaly ? null : d.temperature);
  const anomalyData = data.map(d => d.is_anomaly ? d.temperature : null);

  const ctx = document.getElementById("chart").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Temperature",
          data: normalData,
          borderWidth: 2
        },
        {
          label: "Anomaly",
          data: anomalyData,
          pointRadius: 6,
          showLine: false
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: { display: true, text: "Time Index" }
        },
        y: {
          title: { display: true, text: "Temperature" }
        }
      }
    }
  });
}

// =======================
// UI INTERACTION
// =======================

document.getElementById("dataCount").addEventListener("input", function() {
  document.getElementById("dataCountLabel").textContent = this.value;
});