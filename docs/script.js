let generatedData = [];
let charts = {};
let streamInterval = null;
let currentIndex = 0;

// =======================
// CONFIG
// =======================

function getConfig() {
  return {
    intervalMs: parseInt(document.getElementById("intervalSelect").value)
  };
}

// =======================
// GENERATOR
// =======================

function generatePoint(i) {
  let temp = 25 + Math.sin(i / 10) * 3 + (Math.random() - 0.5);
  let hum = 70 - (temp - 25) * 2 + (Math.random() * 2);
  let motion = Math.random() < 0.1 ? 1 : 0;

  return {
    timestamp: new Date(Date.now() + i * 1000).toISOString(),
    temperature: temp,
    humidity: hum,
    motion: motion
  };
}

// =======================
// AGGREGATION
// =======================

function aggregateData(data, type) {
  if (type === "second") return data;

  let map = {};

  data.forEach(d => {
    let date = new Date(d.timestamp);
    let key;

    if (type === "minute") key = date.toISOString().slice(0, 16);
    if (type === "hour") key = date.toISOString().slice(0, 13);

    if (!map[key]) {
      map[key] = { ...d, count: 1 };
    } else {
      map[key].temperature += d.temperature;
      map[key].humidity += d.humidity;
      map[key].motion += d.motion;
      map[key].count++;
    }
  });

  return Object.values(map).map(d => ({
    timestamp: d.timestamp,
    temperature: d.temperature / d.count,
    humidity: d.humidity / d.count,
    motion: d.motion > 0 ? 1 : 0
  }));
}

// =======================
// CHART
// =======================

function buildChart(id, label, values) {
  const ctx = document.getElementById(id).getContext("2d");

  if (charts[id]) charts[id].destroy();

  charts[id] = new Chart(ctx, {
    type: "line",
    data: {
      labels: values.map((_, i) => i),
      datasets: [{
        label: label,
        data: values
      }]
    }
  });
}

function drawCharts(data) {
  let limited = data.slice(-100); // 🔥 hanya 100 terakhir

  buildChart("tempChart", "Temperature", limited.map(d => d.temperature));
  buildChart("humChart", "Humidity", limited.map(d => d.humidity));
  buildChart("motionChart", "Motion", limited.map(d => d.motion));
}

// =======================
// GENERATE STATIC
// =======================

function generateData() {
  generatedData = [];
  currentIndex = 0;

  let count = parseInt(document.getElementById("generateCount").value) || 100;

  for (let i = 0; i < count; i++) {
    generatedData.push(generatePoint(i));
  }

  let resolution = document.querySelector('input[name="resolution"]:checked').value;
  let data = aggregateData(generatedData, resolution);

  drawCharts(data);

  document.getElementById("liveCount").textContent = generatedData.length;
}

// =======================
// STREAMING
// =======================

function startStreaming() {
  if (streamInterval) return;

  updateStatus("Streaming...");
  let config = getConfig();

  streamInterval = setInterval(() => {

    let point = generatePoint(currentIndex);
    generatedData.push(point);

    let resolution = document.querySelector('input[name="resolution"]:checked').value;
    let data = aggregateData(generatedData, resolution);

    drawCharts(data);

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
// DOWNLOAD
// =======================

function downloadCSV() {
  let resolution = document.querySelector('input[name="resolution"]:checked').value;
  let data = aggregateData(generatedData, resolution);

  let csv = "timestamp,temperature,humidity,motion\n";

  data.forEach(r => {
    csv += `${r.timestamp},${r.temperature},${r.humidity},${r.motion}\n`;
  });

  let blob = new Blob([csv]);
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `data_${resolution}.csv`;
  link.click();
}