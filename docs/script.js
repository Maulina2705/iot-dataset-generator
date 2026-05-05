let generatedData = [];
let charts = {};
let streamInterval = null;
let currentIndex = 0;
let maxDataPoints = 300;
let startTime = null;

// =======================
// CONFIG
// =======================

function getConfig() {
  return {
    deviceCount: parseInt(document.getElementById("deviceCount").value),
    anomalyEnabled: document.getElementById("anomalyToggle").checked,
    showAnomaly: document.getElementById("showAnomaly").checked,
    intervalMs: parseInt(document.getElementById("intervalSelect").value)
  };
}

// =======================
// WEATHER (MARKOV)
// =======================

let weatherState = "clear";

function nextWeather() {
  let rand = Math.random();

  if (weatherState === "clear") {
    if (rand < 0.1) weatherState = "cloudy";
    else if (rand < 0.15) weatherState = "rain";
  } 
  else if (weatherState === "cloudy") {
    if (rand < 0.3) weatherState = "clear";
    else if (rand < 0.5) weatherState = "rain";
  } 
  else if (weatherState === "rain") {
    if (rand < 0.4) weatherState = "cloudy";
  }

  return weatherState;
}

// =======================
// HUMAN ACTIVITY
// =======================

function getActivity(hour) {
  if (hour >= 4 && hour <= 7) return 0.3;
  if (hour >= 18 && hour <= 23) return 0.7;
  return 0.1;
}

// =======================
// TEMPERATURE
// =======================

function generateTemperature(minuteIndex) {
  let hour = (minuteIndex / 60) % 24;

  let base = 27 + 3 * Math.sin((2 * Math.PI * hour) / 24);

  let weatherEffect = 0;
  if (weatherState === "clear") weatherEffect = 2;
  if (weatherState === "cloudy") weatherEffect = 0;
  if (weatherState === "rain") weatherEffect = -3;

  let activityEffect = getActivity(hour) * 2;

  let temp = base + weatherEffect + activityEffect;
  temp += (Math.random() - 0.5);

  return Math.min(Math.max(temp, 22), 36);
}

// =======================
// HUMIDITY
// =======================

function generateHumidity(temp) {
  let humidity = 80 - (temp - 25) * 2;

  if (weatherState === "rain") humidity += 10;
  if (weatherState === "clear") humidity -= 5;

  humidity += (Math.random() * 4 - 2);

  return Math.min(Math.max(humidity, 60), 95);
}

// =======================
// MOTION
// =======================

function generateMotion(hour) {
  return Math.random() < getActivity(hour) ? 1 : 0;
}

// =======================
// ANOMALY DETECTION
// =======================

function detectAnomalies(data) {
  if (data.length < 5) return data.map(d => ({ ...d, is_anomaly: false }));

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
// GENERATE STATIC DATA
// =======================

function generateData() {
  stopStreaming();

  let config = getConfig();
  generatedData = [];
  currentIndex = 0;
  startTime = new Date();

  for (let i = 0; i < 100; i++) {
    nextWeather();

    let simulatedTime = new Date(startTime.getTime() + i * 60000);
    let hour = simulatedTime.getHours();

    let temp = generateTemperature(i);
    let hum = generateHumidity(temp);

    generatedData.push({
      device_id: "room_1",
      timestamp: simulatedTime.toISOString(),
      weather: weatherState,
      temperature: temp,
      humidity: hum,
      motion: generateMotion(hour)
    });
  }

  let updated = detectAnomalies(generatedData);

  drawCharts(updated, config.showAnomaly);
  updateOutput(updated);
}

// =======================
// STREAMING
// =======================

function startStreaming() {
  if (streamInterval) return;

  let config = getConfig();
  generatedData = [];
  currentIndex = 0;
  startTime = new Date();

  updateStatus("Streaming...");

  streamInterval = setInterval(() => {

    nextWeather();

    let stepMinutes = parseInt(document.getElementById("timeStep").value || 1);
    let simulatedTime = new Date(
        startTime.getTime() + currentIndex * stepMinutes * 60000
      );
    let hour = simulatedTime.getHours();

    let temp = generateTemperature(currentIndex);
    let hum = generateHumidity(temp);

    generatedData.push({
      device_id: "room_1",
      timestamp: simulatedTime.toISOString(),
      weather: weatherState,
      temperature: temp,
      humidity: hum,
      motion: generateMotion(hour)
    });

    if (generatedData.length > maxDataPoints) {
      generatedData.shift();
    }

    let updated = detectAnomalies(generatedData);

    drawCharts(updated, config.showAnomaly);
    updateOutput(updated);

    document.getElementById("liveCount").textContent = generatedData.length;

    currentIndex++;

  }, config.intervalMs);
}

function stopStreaming() {
  clearInterval(streamInterval);
  streamInterval = null;
  updateStatus("Stopped");
}

// =======================
// STATUS
// =======================

function updateStatus(text) {
  let el = document.getElementById("status");
  el.textContent = text;
  el.style.color = text.includes("Streaming") ? "green" : "red";
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
          data: showAnomaly ? values.map((v,i)=> anomalies[i]?null:v) : values
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
  if (generatedData.length === 0) return alert("Generate data first!");

  let blob = new Blob([JSON.stringify(generatedData, null, 2)]);
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "data.json";
  link.click();
}

function downloadCSV() {
  if (generatedData.length === 0) return alert("Generate data first!");

  let csv = "timestamp,weather,temperature,humidity,motion\n";

  generatedData.forEach(r => {
    csv += `${r.timestamp},${r.weather},${r.temperature},${r.humidity},${r.motion}\n`;
  });

  let blob = new Blob([csv]);
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "data.csv";
  link.click();
}

// =======================
// UI INIT
// =======================

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("dataCount").addEventListener("input", function() {
    document.getElementById("dataCountLabel").textContent = this.value;
  });
});