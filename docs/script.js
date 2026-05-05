let generatedData = [];
let chart;

// =======================
// SENSOR GENERATORS
// =======================

function generateTemperature(i) {
  let base = 25 + 5 * Math.sin(2 * Math.PI * i / 24);
  let noise = (Math.random() - 0.5);
  let value = base + noise;

  // anomaly
  if (Math.random() < 0.02) {
    value += Math.random() * 20;
  }

  return parseFloat(value.toFixed(2));
}

function generateHumidity(i) {
  let base = 70 - 10 * Math.sin(2 * Math.PI * i / 24);
  let noise = (Math.random() * 4 - 2);
  let value = base + noise;

  if (Math.random() < 0.02) {
    value += (Math.random() * 40 - 20);
  }

  return parseFloat(value.toFixed(2));
}

function generateMotion() {
  return Math.random() < 0.1 ? 1 : 0;
}

// =======================
// MAIN GENERATOR
// =======================

function generateData() {
  let data = [];

  for (let i = 0; i < 100; i++) {
    data.push({
      device_id: "esp32_" + Math.floor(Math.random() * 3 + 1),
      timestamp: new Date(Date.now() + i * 60000).toISOString(),
      temperature: generateTemperature(i),
      humidity: generateHumidity(i),
      motion: generateMotion()
    });
  }

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

  let csv = "device_id,timestamp,temperature,humidity,motion\n";

  generatedData.forEach(row => {
    csv += `${row.device_id},${row.timestamp},${row.temperature},${row.humidity},${row.motion}\n`;
  });

  let blob = new Blob([csv], { type: "text/csv" });

  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "iot_data.csv";
  link.click();
}

// =======================
// CHART
// =======================

function drawChart(data) {
  let labels = data.map((_, i) => i);
  let temps = data.map(d => d.temperature);

  const ctx = document.getElementById("chart").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Temperature (°C)",
        data: temps,
        borderWidth: 2
      }]
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