let streamInterval = null;
let currentIndex = 0;
let maxDataPoints = 200;

// =======================
// STREAMING
// =======================

function startStreaming() {
  if (streamInterval) return;

  let config = getConfig();
  generatedData = [];
  currentIndex = 0;

  updateStatus("Streaming...");

  runStream(config.intervalMs);
}

function runStream(interval) {
  streamInterval = setInterval(() => {
    let config = getConfig();

    let point = {
      device_id: "esp32_" + Math.floor(Math.random() * config.deviceCount + 1),
      timestamp: new Date().toISOString(),
      temperature: generateTemperature(currentIndex, config.anomalyEnabled),
      humidity: generateHumidity(currentIndex, config.anomalyEnabled),
      motion: generateMotion()
    };

    generatedData.push(point);

    // 🔥 batasi data biar ringan
    if (generatedData.length > maxDataPoints) {
      generatedData.shift();
    }

    let updated = detectAnomalies(generatedData);

    drawCharts(updated, config.showAnomaly);
    updateOutput(updated);

    document.getElementById("liveCount").textContent = generatedData.length;

    currentIndex++;

  }, interval);
}

function stopStreaming() {
  clearInterval(streamInterval);
  streamInterval = null;
  updateStatus("Stopped");
}

// =======================
// SPEED CONTROL (REALTIME)
// =======================

document.getElementById("intervalSelect").addEventListener("change", function() {
  if (!streamInterval) return;

  clearInterval(streamInterval);
  streamInterval = null;

  runStream(parseInt(this.value));
});

// =======================
// STATUS UI
// =======================

function updateStatus(text) {
  let el = document.getElementById("status");
  el.textContent = text;

  el.style.color = text.includes("Streaming") ? "green" : "red";
}