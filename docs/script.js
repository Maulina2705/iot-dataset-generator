function generateTemperature(i) {
  let base = 25 + 5 * Math.sin(2 * Math.PI * i / 24);
  let noise = (Math.random() - 0.5);
  let value = base + noise;

  // anomaly
  if (Math.random() < 0.02) {
    value += Math.random() * 20;
  }

  return value.toFixed(2);
}

function generateHumidity(i) {
  let base = 70 - 10 * Math.sin(2 * Math.PI * i / 24);
  let noise = (Math.random() * 4 - 2);
  let value = base + noise;

  if (Math.random() < 0.02) {
    value += (Math.random() * 40 - 20);
  }

  return value.toFixed(2);
}

function generateMotion() {
  return Math.random() < 0.1 ? 1 : 0;
}

function generateData() {
  let data = [];

  for (let i = 0; i < 100; i++) {
    data.push({
      device_id: "esp32_" + Math.floor(Math.random() * 3 + 1),
      timestamp: new Date().toISOString(),
      temperature: generateTemperature(i),
      humidity: generateHumidity(i),
      motion: generateMotion()
    });
  }

  document.getElementById("output").textContent =
    JSON.stringify(data, null, 2);
}