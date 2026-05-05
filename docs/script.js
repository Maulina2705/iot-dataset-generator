let generatedData = [];
let charts = {};
let streamInterval = null;
let currentIndex = 0;

// =======================
// CONFIG
// =======================

function getConfig() {
  return {
    dataCount: parseInt(document.getElementById("dataCount").value),
    deviceCount: parseInt(document.getElementById("deviceCount").value),
    anomalyEnabled: document.getElementById("anomalyToggle").checked,
    showAnomaly: document.getElementById("showAnomaly").checked
  };
}

// =======================
// SENSOR
// =======================

function generateTemperature(i, anomalyEnabled) {
  let base = 25 + 5 * Math.sin(2 * Math.PI * i / 24);
  let value = base + (Math.random() - 0.5);

  if (anomalyEnabled && Math.random() < 0.02) {
    value += Math.random() * 20;
  }

  return parseFloat(value.toFixed(2));
}

function generateHumidity(i, anomalyEnabled) {
  let base = 70 - 10 * Math.sin(2 * Math.PI * i / 24);
  let value = base + (Math.random() * 4 - 2);

  if (anomalyEnabled && Math.random() < 0.02) {
    value += (Math.random() * 40 - 20);
  }

  return parseFloat(value.toFixed(2));
}

function generateMotion() {
  return Math.random() < 0.1 ? 1 : 0;
}

// =======================
// ANOMALY DETECTION
// =======================

function detectAnomalies(data) {
  let temps = data.map(d => d.temperature);
  let mean = temps.reduce((a,b)=>a+b,0)/temps.length;

  let std = Math.sqrt(
    temps.reduce((sum,val)=>sum+(val-mean)**2,0)/temps.length
  );

  return data.map(d => {
    let z = (d.temperature - mean) / std;
    return {...d, is_anomaly: Math.abs(z) > 2.8};
  });
}

// =======================
// GENERATE (STATIC)
// =======================

function generateData() {
  stopStreaming();

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

  data = detectAnomalies(data);
  generatedData = data;

  drawCharts(data, config.showAnomaly);
  updateOutput(data);
}

// =======================
// STREAMING MODE
// =======================

function startStreaming() {
  if (streamInterval) return;

  let config = getConfig();
  generatedData = [];
  currentIndex = 0;

  streamInterval = setInterval(() => {
    let point = {
      device_id: "esp32_" + Math.floor(Math.random() * config.deviceCount + 1),
      timestamp: new Date().toISOString(),
      temperature: generateTemperature(currentIndex, config.anomalyEnabled),
      humidity: generateHumidity(currentIndex, config.anomalyEnabled),
      motion: generateMotion()
    };

    generatedData.push(point);

    let updated = detectAnomalies(generatedData);

    drawCharts(updated, config.showAnomaly);
    updateOutput(updated);

    currentIndex++;

  }, 1000);
}

function stopStreaming() {
  clearInterval(streamInterval);
  streamInterval = null;
}

// =======================
// CHART
// =======================

function buildChart(id, label, values, anomalies, showAnomaly) {
  const ctx = document.getElementById(id).getContext("2d");

  if (charts[id]) charts[id].destroy();

  charts[id] = new Chart(ctx, {
    type: "line",
    data: {
      labels: values.map((_,i)=>i),
      datasets: [
        {
          label: label,
          data: showAnomaly ? values.map((v,i)=> anomalies[i]?null:v) : values,
          borderWidth: 2
        },
        ...(showAnomaly ? [{
          label: "Anomaly",
          data: values.map((v,i)=> anomalies[i]?v:null),
          pointRadius: 6,
          showLine: false
        }] : [])
      ]
    }
  });
}

function drawCharts(data, showAnomaly) {
  let anomalies = data.map(d => d.is_anomaly);

  buildChart("tempChart", "Temperature", data.map(d=>d.temperature), anomalies, showAnomaly);
  buildChart("humChart", "Humidity", data.map(d=>d.humidity), anomalies, showAnomaly);
  buildChart("motionChart", "Motion", data.map(d=>d.motion), anomalies, showAnomaly);
}

// =======================
// OUTPUT
// =======================

function updateOutput(data) {
  document.getElementById("output").textContent =
    JSON.stringify(data.slice(-20), null, 2);
}

// =======================
// DOWNLOAD
// =======================

function downloadJSON() {
  let blob = new Blob([JSON.stringify(generatedData, null, 2)]);
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "data.json";
  link.click();
}

function downloadCSV() {
  let csv = "device_id,timestamp,temperature,humidity,motion,is_anomaly\n";
  generatedData.forEach(r=>{
    csv += `${r.device_id},${r.timestamp},${r.temperature},${r.humidity},${r.motion},${r.is_anomaly}\n`;
  });

  let blob = new Blob([csv]);
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "data.csv";
  link.click();
}

// =======================
// UI
// =======================

document.getElementById("dataCount").addEventListener("input", function() {
  document.getElementById("dataCountLabel").textContent = this.value;
});