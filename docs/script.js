// =======================
// GLOBAL STATE
// =======================
let generatedData = [];
let charts = {};
let streamInterval = null;
let currentIndex = 0;
let startTime = null;

// day-scoped state (reset tiap hari simulasi)
let dayState = resetDayState();

// =======================
// CONFIG
// =======================
function getConfig() {
  return {
    intervalMs: parseInt(document.getElementById("intervalSelect").value || 1000)
  };
}

// =======================
// DAY STATE (charger patterns, etc.)
// =======================
function resetDayState() {
  // 0-23 hours
  const randBetween = (a, b) => Math.floor(a + Math.random() * (b - a + 1));

  // Laptop: 6–10 jam, 1–2 break
  const laptopStart = randBetween(8, 12);
  const laptopDuration = randBetween(6, 10);
  const laptopEnd = Math.min(23, laptopStart + laptopDuration);
  const breaks = Math.random() < 0.5 ? 1 : 2;
  const breakSlots = [];
  for (let i = 0; i < breaks; i++) {
    const bh = randBetween(laptopStart + 1, laptopEnd - 1);
    breakSlots.push(bh);
  }

  // Phone: max ~2 sessions/day (charging windows)
  const phoneSessions = [];
  const psCount = Math.random() < 0.7 ? 2 : 1;
  for (let i = 0; i < psCount; i++) {
    const sh = randBetween(7, 22);
    const durMin = randBetween(30, 90); // minutes
    phoneSessions.push({ startHour: sh, durationMin: durMin });
  }

  // Tablet: optional 0–1 session
  const tabletSessions = [];
  if (Math.random() < 0.5) {
    const sh = randBetween(10, 22);
    const durMin = randBetween(40, 120);
    tabletSessions.push({ startHour: sh, durationMin: durMin });
  }

  return {
    laptopStart,
    laptopEnd,
    breakSlots,
    phoneSessions,
    tabletSessions
  };
}

// =======================
// WEATHER (Markov-ish)
// =======================
let weatherState = "clear"; // clear, cloudy, rain

function nextWeather() {
  const r = Math.random();
  if (weatherState === "clear") {
    if (r < 0.08) weatherState = "cloudy";
    else if (r < 0.12) weatherState = "rain";
  } else if (weatherState === "cloudy") {
    if (r < 0.25) weatherState = "clear";
    else if (r < 0.45) weatherState = "rain";
  } else if (weatherState === "rain") {
    if (r < 0.4) weatherState = "cloudy";
  }
  return weatherState;
}

// =======================
// TIME HELPERS
// =======================
function getSimulatedTime(idx) {
  // base: detik
  return new Date(startTime.getTime() + idx * 1000);
}
function getHour(t) { return t.getHours(); }
function isNight(hour) { return hour < 6 || hour >= 18; }

// =======================
// OCCUPANCY (0–7 orang, jarang >4)
// =======================
let currentOccupancy = 0;

function updateOccupancy(hour) {
  // probabilitas dasar
  let pEnter = 0.02, pLeave = 0.02;

  if (hour >= 18 && hour <= 23) { pEnter = 0.05; pLeave = 0.03; }
  else if (hour >= 4 && hour <= 7) { pEnter = 0.03; pLeave = 0.02; }
  else { pEnter = 0.01; pLeave = 0.03; } // siang cenderung kosong

  // masuk/keluar
  if (Math.random() < pEnter) {
    currentOccupancy = Math.min(7, currentOccupancy + 1);
  }
  if (Math.random() < pLeave) {
    currentOccupancy = Math.max(0, currentOccupancy - 1);
  }

  // bias: >4 jarang
  if (currentOccupancy > 4 && Math.random() < 0.5) {
    currentOccupancy = Math.max(0, currentOccupancy - 1);
  }

  return currentOccupancy;
}

// =======================
// PIR (motion) vs occupancy
// =======================
function generatePIR(occupancy, hour) {
  if (occupancy === 0) return 0;

  // malam lebih aktif
  let base = 0.2;
  if (hour >= 18 && hour <= 23) base = 0.5;
  if (hour >= 4 && hour <= 7) base = 0.35;

  // makin banyak orang → makin sering gerak
  let p = base + Math.min(0.4, occupancy * 0.1);

  // kondisi tidur (malam larut) → PIR bisa turun
  if (hour >= 0 && hour <= 3) p *= 0.5;

  return Math.random() < p ? 1 : 0;
}

// =======================
// LIGHT (natural + lamp)
// =======================
function computeNaturalLight(hour, weather) {
  // 0–100 scale
  if (isNight(hour)) return 5;

  // siang
  let base = 80;
  if (weather === "clear") base = 90;
  if (weather === "cloudy") base = 60;
  if (weather === "rain") base = 40;

  // sinus siang (puncak jam 12)
  const daylight = 0.5 + 0.5 * Math.sin((Math.PI * (hour - 6)) / 12);
  return Math.max(0, Math.min(100, base * daylight));
}

function computeLampStatus(naturalLight, occupancy) {
  // ON jika gelap & ada orang, atau mendung + ada orang
  if (occupancy === 0) return 0;
  if (naturalLight < 30) return 1;
  if (weatherState === "cloudy" && naturalLight < 50) return 1;
  return 0;
}

// =======================
// TEMPERATURE & HUMIDITY
// =======================
let fanOn = 0;

function generateTemperature(idx, hour, occupancy) {
  // base harian
  const base = 27 + 3 * Math.sin((2 * Math.PI * hour) / 24);

  // weather effect
  let w = 0;
  if (weatherState === "clear") w = 2;
  if (weatherState === "cloudy") w = 0;
  if (weatherState === "rain") w = -3;

  // occupancy heat
  const occ = occupancy * 0.4;

  // fan cooling (stateful, hysteresis)
  // ON jika > 30 atau occupancy >= 3
  if (fanOn === 0 && (base + w + occ > 30 || occupancy >= 3)) {
    fanOn = 1;
  }
  // OFF jika sudah cukup dingin
  if (fanOn === 1 && (base + w + occ < 26 && occupancy < 2)) {
    fanOn = 0;
  }

  const fanEffect = fanOn ? -2 : 0;

  let temp = base + w + occ + fanEffect + (Math.random() - 0.5);

  return Math.max(22, Math.min(36, temp));
}

function generateHumidity(temp) {
  let h = 80 - (temp - 25) * 2;
  if (weatherState === "rain") h += 10;
  if (weatherState === "clear") h -= 5;
  h += (Math.random() * 4 - 2);
  return Math.max(60, Math.min(95, h));
}

// =======================
// DEVICES: fan, lamp, chargers
// =======================
const W = {
  fan: 80,
  lamp: 12,
  phone: 25,
  tablet: 40,
  laptop: 65
};

function isInSession(hour, minute, session) {
  const startMin = session.startHour * 60;
  const nowMin = hour * 60 + minute;
  return nowMin >= startMin && nowMin <= startMin + session.durationMin;
}

function computeLaptopStatus(hour) {
  if (hour < dayState.laptopStart || hour > dayState.laptopEnd) return 0;
  if (dayState.breakSlots.includes(hour)) return 0;
  return 1;
}

function computePhoneStatus(hour, minute) {
  return dayState.phoneSessions.some(s => isInSession(hour, minute, s)) ? 1 : 0;
}

function computeTabletStatus(hour, minute) {
  return dayState.tabletSessions.some(s => isInSession(hour, minute, s)) ? 1 : 0;
}

// =======================
// TOTAL POWER (house baseline + noise)
// =======================
function computeTotalPower(roomPower) {
  // baseline rumah (kulkas, TV, dll)
  const base = 100 + Math.random() * 200; // 100–300W
  const noise = (Math.random() - 0.5) * 30;
  return Math.max(0, roomPower + base + noise);
}

// =======================
// POINT GENERATOR (ADVANCED)
// =======================
function generatePoint(idx) {
  const t = getSimulatedTime(idx);

  // reset daily pattern saat ganti hari
  if (t.getHours() === 0 && t.getMinutes() === 0 && t.getSeconds() === 0 && idx !== 0) {
    dayState = resetDayState();
  }

  const hour = getHour(t);
  const minute = t.getMinutes();

  nextWeather();

  const occupancy = updateOccupancy(hour);
  const pir = generatePIR(occupancy, hour);

  const naturalLight = computeNaturalLight(hour, weatherState);
  const lampStatus = computeLampStatus(naturalLight, occupancy);
  const light = Math.min(100, naturalLight + (lampStatus ? 30 : 0));

  const temperature = generateTemperature(idx, hour, occupancy);
  const humidity = generateHumidity(temperature);

  const fanStatus = fanOn ? 1 : 0;

  const phoneOn = computePhoneStatus(hour, minute);
  const tabletOn = computeTabletStatus(hour, minute);
  const laptopOn = computeLaptopStatus(hour);

  const fanPower = fanStatus ? W.fan : 0;
  const lampPower = lampStatus ? W.lamp : 0;
  const phonePower = phoneOn ? W.phone : 0;
  const tabletPower = tabletOn ? W.tablet : 0;
  const laptopPower = laptopOn ? W.laptop : 0;

  const roomPower = fanPower + lampPower + phonePower + tabletPower + laptopPower;
  const totalPower = computeTotalPower(roomPower);

  return {
    timestamp: t.toISOString(),
    weather: weatherState,

    temperature,
    humidity,
    light,

    occupancy,          // ultrasonic proxy
    pir,                // motion

    fan_status: fanStatus,
    fan_power: fanPower,

    lamp_status: lampStatus,
    lamp_power: lampPower,

    charger_phone_status: phoneOn,
    charger_phone_power: phonePower,

    charger_tablet_status: tabletOn,
    charger_tablet_power: tabletPower,

    charger_laptop_status: laptopOn,
    charger_laptop_power: laptopPower,

    room_power: roomPower,
    total_power: totalPower
  };
}

// =======================
// AGGREGATION (second/minute/hour)
// =======================
function aggregateData(data, type) {
  if (type === "second") return data;

  const map = {};

  data.forEach(d => {
    const date = new Date(d.timestamp);
    let key;
    if (type === "minute") key = date.toISOString().slice(0, 16);
    if (type === "hour") key = date.toISOString().slice(0, 13);

    if (!map[key]) {
      map[key] = { ...d, count: 1 };
    } else {
      map[key].temperature += d.temperature;
      map[key].humidity += d.humidity;
      map[key].light += d.light;

      map[key].pir += d.pir;
      map[key].occupancy += d.occupancy;

      map[key].fan_power += d.fan_power;
      map[key].lamp_power += d.lamp_power;
      map[key].charger_phone_power += d.charger_phone_power;
      map[key].charger_tablet_power += d.charger_tablet_power;
      map[key].charger_laptop_power += d.charger_laptop_power;

      map[key].room_power += d.room_power;
      map[key].total_power += d.total_power;

      map[key].count++;
    }
  });

  return Object.values(map).map(d => ({
    timestamp: d.timestamp,
    temperature: d.temperature / d.count,
    humidity: d.humidity / d.count,
    light: d.light / d.count,

    pir: d.pir > 0 ? 1 : 0,
    occupancy: Math.round(d.occupancy / d.count),

    fan_power: d.fan_power / d.count,
    lamp_power: d.lamp_power / d.count,
    charger_phone_power: d.charger_phone_power / d.count,
    charger_tablet_power: d.charger_tablet_power / d.count,
    charger_laptop_power: d.charger_laptop_power / d.count,

    room_power: d.room_power / d.count,
    total_power: d.total_power / d.count
  }));
}

// =======================
// CHART (100 last points)
// =======================
function buildMultiChart(id, datasets) {
  const ctx = document.getElementById(id).getContext("2d");

  if (charts[id]) charts[id].destroy();

  charts[id] = new Chart(ctx, {
    type: "line",
    data: {
      labels: datasets[0].data.map((_, i) => i),
      datasets: datasets
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: { beginAtZero: false }
      }
    }
  });
}

function drawCharts(data) {
  let limited = data.slice(-100);

  // =======================
  // ENVIRONMENT
  // =======================
  buildMultiChart("envChart", [
    { label: "Temperature (T)", data: limited.map(d => d.temperature) },
    { label: "Humidity (H)", data: limited.map(d => d.humidity) },
    { label: "Light1", data: limited.map(d => d.light) },
    { label: "Light2", data: limited.map(d => d.light * 0.8) } // simulasi luar
  ]);

  // =======================
  // OCCUPANCY
  // =======================
  buildMultiChart("occChart", [
    { label: "Motion (PIR)", data: limited.map(d => d.pir) },
    { label: "Counter Visitor", data: limited.map(d => d.occupancy) }
  ]);

  // =======================
  // DEVICE STATUS
  // =======================
  buildMultiChart("statusChart", [
    { label: "S-K (Fan)", data: limited.map(d => d.fan_status) },
    { label: "S-C (Charger)", data: limited.map(d =>
        (d.charger_phone_status || d.charger_tablet_status || d.charger_laptop_status) ? 1 : 0
    )},
    { label: "S-L (Lamp)", data: limited.map(d => d.lamp_status) }
  ]);

  // =======================
  // POWER
  // =======================
  buildMultiChart("powerChart", [
    { label: "P-K (Fan)", data: limited.map(d => d.fan_power) },
    { label: "P-C (Charger)", data: limited.map(d =>
        d.charger_phone_power + d.charger_tablet_power + d.charger_laptop_power
    )},
    { label: "P-L (Lamp)", data: limited.map(d => d.lamp_power) },
    { label: "Total Power (TP)", data: limited.map(d => d.total_power) }
  ]);
}

// =======================
// GENERATE STATIC (custom rows)
// =======================
function generateData() {
  generatedData = [];
  currentIndex = 0;
  startTime = new Date();
  dayState = resetDayState();
  currentOccupancy = 0;
  fanOn = 0;

  const count = parseInt(document.getElementById("generateCount").value || 200);

  for (let i = 0; i < count; i++) {
    generatedData.push(generatePoint(i));
  }

  const res = document.querySelector('input[name="resolution"]:checked').value;
  const data = aggregateData(generatedData, res);

  drawCharts(data);
  document.getElementById("liveCount").textContent = generatedData.length;
}

// =======================
// STREAMING
// =======================
function startStreaming() {
  if (streamInterval) return;

  updateStatus("Streaming...");
  const config = getConfig();

  generatedData = [];
  currentIndex = 0;
  startTime = new Date();
  dayState = resetDayState();
  currentOccupancy = 0;
  fanOn = 0;

  streamInterval = setInterval(() => {
    const point = generatePoint(currentIndex);
    generatedData.push(point);

    const res = document.querySelector('input[name="resolution"]:checked').value;
    const data = aggregateData(generatedData, res);

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
  const el = document.getElementById("status");
  el.textContent = text;
  el.style.color = text.includes("Streaming") ? "green" : "red";
}

// =======================
// DOWNLOAD (respect resolution)
// =======================
function downloadCSV() {
  if (generatedData.length === 0) return alert("Generate data first!");

  const res = document.querySelector('input[name="resolution"]:checked').value;
  const data = aggregateData(generatedData, res);

  let csv = "timestamp,weather,temperature,humidity,light,occupancy,pir,fan_power,lamp_power,charger_phone_power,charger_tablet_power,charger_laptop_power,room_power,total_power\n";

  data.forEach(r => {
    csv += `${r.timestamp},${r.weather ?? ""},${r.temperature},${r.humidity},${r.light},${r.occupancy},${r.pir},${r.fan_power},${r.lamp_power},${r.charger_phone_power},${r.charger_tablet_power},${r.charger_laptop_power},${r.room_power},${r.total_power}\n`;
  });

  const blob = new Blob([csv]);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `advanced_iot_${res}.csv`;
  link.click();
}