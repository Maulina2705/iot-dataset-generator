console.log("JS LOADED");

// =======================
// GLOBAL STATE
// =======================
let generatedData = [];
let charts = {};
let streamInterval = null;
let currentIndex = 0;
let startTime = null;

let deviceState = {
  fan: { power: 0 },
  lamp: { power: 0 },
  charger: { power: 0 }
};

let currentOccupancy = 0;
let weatherState = "clear";

// =======================
// MQTT SETUP
// =======================
let client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");

client.on("connect", () => {
  console.log("✅ MQTT Connected");
});

client.on("reconnect", () => {
  console.log("🔄 Reconnecting MQTT...");
});

client.on("error", (err) => {
  console.error("❌ MQTT Error:", err);
});

// =======================
// CONFIG
// =======================
function getConfig() {
  return {
    intervalMs: parseInt(document.getElementById("intervalSelect").value || 1000)
  };
}

// =======================
// TIME
// =======================
function getSimulatedTime(idx) {
  return new Date(startTime.getTime() + idx * 1000);
}

// =======================
// WEATHER (MARKOV)
// =======================
function nextWeather() {
  let r = Math.random();

  if (weatherState === "clear") {
    if (r < 0.1) weatherState = "cloudy";
    else if (r < 0.15) weatherState = "rain";
  } else if (weatherState === "cloudy") {
    if (r < 0.3) weatherState = "clear";
    else if (r < 0.5) weatherState = "rain";
  } else {
    if (r < 0.4) weatherState = "cloudy";
  }

  return weatherState;
}

// =======================
// OCCUPANCY
// =======================
function updateOccupancy(hour) {
  let pEnter = 0.02;
  let pLeave = 0.02;

  if (hour >= 18) pEnter = 0.05;
  if (hour < 6) pEnter = 0.03;

  if (Math.random() < pEnter) {
    currentOccupancy = Math.min(7, currentOccupancy + 1);
  }

  if (Math.random() < pLeave) {
    currentOccupancy = Math.max(0, currentOccupancy - 1);
  }

  return currentOccupancy;
}

// =======================
// PIR
// =======================
function generatePIR(occ) {
  if (occ === 0) return 0;
  return Math.random() < (0.2 + occ * 0.1) ? 1 : 0;
}

// =======================
// LIGHT
// =======================
function getNaturalLight(hour) {
  if (hour < 6 || hour > 18) return 5;

  let base = 80;
  if (weatherState === "cloudy") base = 60;
  if (weatherState === "rain") base = 40;

  return base;
}

// =======================
// TEMP & HUM
// =======================
function generateTemp(hour, occ) {
  let base = 27 + 3 * Math.sin((2 * Math.PI * hour) / 24);
  let occHeat = occ * 0.4;

  if (weatherState === "rain") base -= 2;

  return base + occHeat + (Math.random() - 0.5);
}

function generateHum(temp) {
  let h = 80 - (temp - 25) * 2;

  if (weatherState === "rain") h += 10;

  return Math.max(60, Math.min(95, h));
}

// =======================
// POWER ENGINE 🔥
// =======================
function simulatePower(target, prev) {

  if (target === 0) {
    return Math.max(0, prev - Math.random() * 5);
  }

  let diff = target - prev;
  let ramp = diff * 0.2;

  let noise = (Math.random() - 0.5) * target * 0.05;
  let spike = Math.random() < 0.05 ? target * 0.1 : 0;

  return Math.max(0, prev + ramp + noise + spike);
}

// =======================
// GENERATE POINT
// =======================
function generatePoint(i) {
  let t = getSimulatedTime(i);
  let hour = t.getHours();

  nextWeather();

  let occ = updateOccupancy(hour);
  let pir = generatePIR(occ);

  let light1 = getNaturalLight(hour);
  let lampStatus = (light1 < 40 && occ > 0) ? 1 : 0;
  let light2 = light1 + 20;

  let temp = generateTemp(hour, occ);
  let hum = generateHum(temp);

  let fanStatus = (temp > 30 || occ >= 3) ? 1 : 0;
  let chargerStatus = Math.random() < 0.1 ? 1 : 0;

  const W = { fan: 80, lamp: 12, charger: 65 };

  deviceState.fan.power = simulatePower(fanStatus ? W.fan : 0, deviceState.fan.power);
  deviceState.lamp.power = simulatePower(lampStatus ? W.lamp : 0, deviceState.lamp.power);
  deviceState.charger.power = simulatePower(chargerStatus ? W.charger : 0, deviceState.charger.power);

  let fanPower = deviceState.fan.power;
  let lampPower = deviceState.lamp.power;
  let chargerPower = deviceState.charger.power;

  let roomPower = fanPower + lampPower + chargerPower;

  let baseLoad = 150 + Math.sin(i / 50) * 50;
  let noise = (Math.random() - 0.5) * 20;

  let totalPower = roomPower + baseLoad + noise;

  return {
    timestamp: t.toISOString(),

    temperature: temp,
    humidity: hum,

    light: light1,
    light_out: light2,

    pir: pir,
    occupancy: occ,

    fan_status: fanStatus,
    lamp_status: lampStatus,
    charger_status: chargerStatus,

    fan_power: fanPower,
    lamp_power: lampPower,
    charger_power: chargerPower,

    total_power: totalPower
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

    let key = type === "minute"
      ? date.toISOString().slice(0, 16)
      : date.toISOString().slice(0, 13);

    if (!map[key]) {
      map[key] = { ...d, count: 1 };
    } else {
      map[key].temperature += d.temperature;
      map[key].humidity += d.humidity;
      map[key].total_power += d.total_power;
      map[key].count++;
    }
  });

  return Object.values(map).map(d => ({
    ...d,
    temperature: d.temperature / d.count,
    humidity: d.humidity / d.count,
    total_power: d.total_power / d.count
  }));
}

// =======================
// CHART
// =======================
function buildMultiChart(id, datasets) {
  let ctx = document.getElementById(id).getContext("2d");

  if (charts[id]) charts[id].destroy();

  charts[id] = new Chart(ctx, {
    type: "line",
    data: {
      labels: datasets[0].data.map((_, i) => i),
      datasets: datasets
    }
  });
}

function drawCharts(data) {
  let d = data.slice(-100);

  buildMultiChart("envChart", [
    { label: "Temperature (T)", data: d.map(x => x.temperature) },
    { label: "Humidity (H)", data: d.map(x => x.humidity) },
    { label: "Light1", data: d.map(x => x.light) },
    { label: "Light2", data: d.map(x => x.light_out) }
  ]);

  buildMultiChart("occChart", [
    { label: "Motion (PIR)", data: d.map(x => x.pir) },
    { label: "Counter Visitor", data: d.map(x => x.occupancy) }
  ]);

  buildMultiChart("statusChart", [
    { label: "S-K (Fan)", data: d.map(x => x.fan_status) },
    { label: "S-C (Charger)", data: d.map(x => x.charger_status) },
    { label: "S-L (Lamp)", data: d.map(x => x.lamp_status) }
  ]);

  buildMultiChart("powerChart", [
    { label: "P-K (Fan)", data: d.map(x => x.fan_power) },
    { label: "P-C (Charger)", data: d.map(x => x.charger_power) },
    { label: "P-L (Lamp)", data: d.map(x => x.lamp_power) },
    { label: "Total Power (TP)", data: d.map(x => x.total_power) }
  ]);
}

// =======================
// GENERATE
// =======================
function generateData() {
  generatedData = [];
  currentIndex = 0;
  startTime = new Date();

  deviceState = { fan: { power: 0 }, lamp: { power: 0 }, charger: { power: 0 } };
  currentOccupancy = 0;
  weatherState = "clear";

  let count = parseInt(document.getElementById("generateCount").value || 200);

  for (let i = 0; i < count; i++) {
    generatedData.push(generatePoint(i));
  }

  let res = document.querySelector('input[name="resolution"]:checked').value;

  drawCharts(aggregateData(generatedData, res));
  document.getElementById("liveCount").textContent = generatedData.length;
}

// =======================
// STREAMING
// =======================
function startStreaming() {
  if (streamInterval) return;

  startTime = new Date();
  currentIndex = 0;
  generatedData = [];

  deviceState = { fan: { power: 0 }, lamp: { power: 0 }, charger: { power: 0 } };
  currentOccupancy = 0;
  weatherState = "clear";

  updateStatus("Streaming...");

  let config = getConfig();

  streamInterval = setInterval(() => {
    let p = generatePoint(currentIndex);
    generatedData.push(p);

    // 🔥 MQTT PUBLISH
    if (client && client.connected) {
      client.publish("iot/smartroom/data", JSON.stringify(p));
      console.log("📡 Sent:", new Date().toLocaleTimeString(), p);
    }

    let res = document.querySelector('input[name="resolution"]:checked').value;

    drawCharts(aggregateData(generatedData, res));
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
  let res = document.querySelector('input[name="resolution"]:checked').value;
  let data = aggregateData(generatedData, res);

  let csv = Object.keys(data[0]).join(",") + "\n";

  data.forEach(r => {
    csv += Object.values(r).join(",") + "\n";
  });

  let blob = new Blob([csv]);
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "iot_dataset.csv";
  link.click();
}