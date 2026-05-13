console.log("Realtime Engine Started 🚀");

/* ========================= */
/* MAIN CHART */
/* ========================= */

const ctx = document
    .getElementById("mainChart")
    .getContext("2d");

/* ========================= */
/* INITIAL DATA */
/* ========================= */

let labels = [];
let powerData = [];
let occupancyData = [];

/* ========================= */
/* GENERATE INITIAL */
/* ========================= */

for (let i = 0; i < 24; i++) {

    labels.push(`${i}:00`);

    powerData.push(
        1.2 +
        Math.random() * 1.5
    );

    occupancyData.push(
        Math.floor(
            2 + Math.random() * 6
        )
    );
}

/* ========================= */
/* CHART */
/* ========================= */

/* ========================= */
/* CHART DATASETS */
/* ========================= */

const chartData = {

    "24H": {

        labels: [
            "0:00", "1:00", "2:00", "3:00",
            "4:00", "5:00", "6:00", "7:00",
            "8:00", "9:00", "10:00", "11:00",
            "12:00", "13:00", "14:00", "15:00",
            "16:00", "17:00", "18:00", "19:00",
            "20:00", "21:00", "22:00", "23:00"
        ],

        power: [
            2.0, 2.4, 2.5, 2.1,
            1.2, 1.7, 2.3, 1.5,
            2.0, 1.9, 1.7, 2.6,
            1.3, 2.2, 1.2, 1.1,
            1.2, 1.4, 1.2, 1.0,
            0.9, 0.7, 0.8, 0.6
        ],

        occupancy: [
            7, 4, 6, 5,
            2, 5, 7, 7,
            3, 3, 6, 5,
            7, 7, 2, 5,
            6, 3, 4, 5,
            6, 6, 7, 7
        ]
    },

    "7D": {

        labels: [
            "Mon", "Tue", "Wed",
            "Thu", "Fri", "Sat", "Sun"
        ],

        power: [
            18, 22, 25, 20, 26, 17, 15
        ],

        occupancy: [
            5, 6, 7, 5, 8, 4, 3
        ]
    },

    "30D": {

        labels: [
            "W1", "W2", "W3", "W4"
        ],

        power: [
            120, 140, 110, 170
        ],

        occupancy: [
            4, 6, 5, 7
        ]
    }
};

const mainChart = new Chart(ctx, {

    type: "line",

    data: {

        labels: chartData["24H"].labels,

        datasets: [

            {
                label: "Power (kW)",

                data: chartData["24H"].power,

                borderColor: "#00c2ff",

                backgroundColor:
                    "rgba(0,194,255,0.15)",

                borderWidth: 3,

                tension: 0.45,

                fill: true,

                pointRadius: 0,

                pointHoverRadius: 6,

                pointHoverBackgroundColor:
                    "#00c2ff",

                yAxisID: "y",
            },

            {
                label: "Occupancy",

                data: chartData["24H"].occupancy,

                borderColor: "#9b5cff",

                backgroundColor:
                    "rgba(155,92,255,0.08)",

                borderWidth: 3,

                tension: 0.45,

                fill: false,

                pointRadius: 0,

                pointHoverRadius: 6,

                pointHoverBackgroundColor:
                    "#9b5cff",

                yAxisID: "y1",
            }
        ]
    },

    options: {

        responsive: true,

        maintainAspectRatio: false,

        interaction: {
            mode: "index",
            intersect: false
        },

        plugins: {

            legend: {

                labels: {
                    color: "#8fa3b8",
                    usePointStyle: true,
                    pointStyle: "circle",
                    padding: 20
                }
            },

            tooltip: {

                backgroundColor: "#111c29",

                borderColor:
                    "rgba(255,255,255,0.08)",

                borderWidth: 1,

                padding: 14,

                titleColor: "#ffffff",

                bodyColor: "#8fa3b8",

                displayColors: true
            }
        },

        scales: {

            x: {

                grid: {
                    color:
                        "rgba(255,255,255,0.03)"
                },

                ticks: {
                    color: "#6f8193"
                }
            },

            y: {

                position: "left",

                grid: {
                    color:
                        "rgba(255,255,255,0.04)"
                },

                ticks: {
                    color: "#00c2ff"
                }
            },

            y1: {

                position: "right",

                grid: {
                    drawOnChartArea: false
                },

                ticks: {
                    color: "#9b5cff"
                }
            }
        }
    }
});

/* ========================= */
/* REALTIME UPDATE */
/* ========================= */

setInterval(() => {

    powerData.shift();
    occupancyData.shift();

    const lastPower =
        powerData[powerData.length - 1];

    const nextPower =
        Math.max(
            0.5,
            lastPower +
            (Math.random() - 0.5) * 0.5
        );

    const nextOcc =
        Math.max(
            0,
            Math.min(
                10,
                occupancyData[
                occupancyData.length - 1
                ] + Math.floor(Math.random() * 3 - 1)
            )
        );

    powerData.push(nextPower);
    occupancyData.push(nextOcc);

    mainChart.update();

}, 2000);

/* ========================= */
/* LIVE CLOCK */
/* ========================= */

function updateClock() {

    const now = new Date();

    const hours =
        String(now.getHours())
            .padStart(2, "0");

    const minutes =
        String(now.getMinutes())
            .padStart(2, "0");

    document.getElementById(
        "liveClock"
    ).textContent =
        `${hours}:${minutes}`;
}

updateClock();

setInterval(updateClock, 1000);

const presetSelect =
    document.getElementById("presetSelect");

let activePreset = "Normal Day";

/* ========================= */
/* LIVE ACTIVITY */
/* ========================= */

const presetActivities = {

    "Normal Day": [

        "Occupancy stabilized within normal threshold",

        "Environment telemetry operating normally",

        "Power usage remained consistent",

        "Realtime sensor synchronization active",

        "Ambient conditions stable"
    ],

    "High Occupancy": [

        "Occupancy surge detected in monitored zone",

        "Cooling demand increased significantly",

        "Fan speed escalated automatically",

        "Realtime consumption trending upward",

        "Environmental load balancing active"
    ],

    "Energy Saving": [

        "Eco mode enabled across devices",

        "Non-critical systems switched to standby",

        "Smart power optimization active",

        "Low-energy telemetry profile detected",

        "Consumption reduced successfully"
    ],

    "Power Spike": [

        "Voltage fluctuation detected",

        "Realtime power spike identified",

        "Electrical load redistribution active",

        "High consumption anomaly detected",

        "Smart charger operating above baseline"
    ],

    "Rainy Environment": [

        "Humidity compensation activated",

        "Moisture stabilization process running",

        "Condensation prevention enabled",

        "Environmental humidity elevated",

        "Realtime climate adjustment active"
    ]
};

const activityList =
    document.getElementById(
        "activityList"
    );

function renderActivities() {

    activityList.innerHTML = "";

    const activeActivities =
        presetActivities[activePreset];

    const shuffled =
        [...activeActivities]
            .sort(() => 0.5 - Math.random());

    shuffled
        .slice(0, 3)
        .forEach(message => {

            const item =
                document.createElement("div");

            item.className =
                "feed-item";

            item.textContent =
                message;

            activityList.appendChild(item);

        });
}

renderActivities();

setInterval(renderActivities, 5000);

/* ========================= */
/* ENVIRONMENT REALTIME */
/* ========================= */

const tempValue =
    document.getElementById(
        "tempValue"
    );

const tempStatus =
    document.getElementById(
        "tempStatus"
    );

const humidityValue =
    document.getElementById(
        "humidityValue"
    );

const humidityStatus =
    document.getElementById(
        "humidityStatus"
    );

const aqiValue =
    document.getElementById(
        "aqiValue"
    );

const aqiStatus =
    document.getElementById(
        "aqiStatus"
    );

const co2Value =
    document.getElementById(
        "co2Value"
    );

const co2Status =
    document.getElementById(
        "co2Status"
    );

function updateEnvironment() {

    /* TEMP */
    let baseTemp = 25;

    if (activePreset === "High Occupancy") {
        baseTemp = 29;
    }

    if (activePreset === "Energy Saving") {
        baseTemp = 23;
    }

    if (activePreset === "Rainy Environment") {
        baseTemp = 24;
    }

    const temp =
        (baseTemp + Math.random() * 2)
            .toFixed(1);

    tempValue.textContent =
        `${temp}°C`;

    tempStatus.textContent =
        temp > 28
            ? "Warning"
            : "Normal";

    /* HUMIDITY */
    let humidityBase = 45;

    if (activePreset === "Rainy Environment") {
        humidityBase = 70;
    }

    if (activePreset === "Energy Saving") {
        humidityBase = 40;
    }

    const humidity =
        Math.floor(
            humidityBase + Math.random() * 15
        );

    humidityValue.textContent =
        `${humidity}%`;

    humidityStatus.textContent =
        humidity > 65
            ? "High"
            : "Stable";

    /* AQI */
    const aqi =
        Math.floor(
            60 + Math.random() * 40
        );

    aqiValue.textContent =
        `${aqi} AQI`;

    aqiStatus.textContent =
        aqi > 100
            ? "Moderate"
            : "Good";

    /* CO2 */
    const co2 =
        Math.floor(
            500 + Math.random() * 300
        );

    co2Value.textContent =
        `${co2} ppm`;

    co2Status.textContent =
        co2 > 750
            ? "High"
            : "Normal";
}

updateEnvironment();

setInterval(
    updateEnvironment,
    4000
);

/* ========================= */
/* DEVICE REALTIME */
/* ========================= */

const fanPower =
    document.getElementById(
        "fanPower"
    );

const lampPower =
    document.getElementById(
        "lampPower"
    );

const chargerPower =
    document.getElementById(
        "chargerPower"
    );

const fanStatus =
    document.getElementById(
        "fanStatus"
    );

const lampStatus =
    document.getElementById(
        "lampStatus"
    );

const chargerStatus =
    document.getElementById(
        "chargerStatus"
    );

function updateDevices() {

    let fanMin = 40;
    let fanMax = 90;

    let lampMin = 5;
    let lampMax = 20;

    let chargerMin = 20;
    let chargerMax = 80;

    /* ========================= */
    /* PRESET LOGIC */
    /* ========================= */

    if (activePreset === "High Occupancy") {

        fanMin = 70;
        fanMax = 120;

        lampMin = 15;
        lampMax = 35;

        chargerMin = 60;
        chargerMax = 100;
    }

    if (activePreset === "Energy Saving") {

        fanMin = 20;
        fanMax = 50;

        lampMin = 3;
        lampMax = 10;

        chargerMin = 10;
        chargerMax = 40;
    }

    if (activePreset === "Power Spike") {

        chargerMin = 90;
        chargerMax = 160;
    }

    if (activePreset === "Rainy Environment") {

        lampMin = 20;
        lampMax = 45;
    }

    updateSingleDevice(
        fanPower,
        fanStatus,
        fanMin,
        fanMax
    );

    updateSingleDevice(
        lampPower,
        lampStatus,
        lampMin,
        lampMax
    );

    updateSingleDevice(
        chargerPower,
        chargerStatus,
        chargerMin,
        chargerMax
    );
}

function updateSingleDevice(
    powerElement,
    statusElement,
    min,
    max
) {

    const active =
        Math.random() > 0.2;

    if (active) {

        const watt =
            Math.floor(
                min +
                Math.random() *
                (max - min)
            );

        powerElement.textContent =
            `${watt}W`;

        statusElement.textContent =
            "ACTIVE";

        statusElement.style.color =
            "#00ff99";

    } else {

        powerElement.textContent =
            "0W";

        statusElement.textContent =
            "STANDBY";

        statusElement.style.color =
            "#777";
    }
}

updateDevices();

setInterval(
    updateDevices,
    5000
);

/* ========================= */
/* CHART FILTER */
/* ========================= */

const filterButtons =
    document.querySelectorAll(
        ".filter-btn"
    );

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(btn =>
                btn.classList.remove(
                    "active"
                )
            );

            button.classList.add(
                "active"
            );

            const range =
                button.innerText;

            mainChart.data.labels =
                chartData[range].labels;

            mainChart.data.datasets[0].data =
                chartData[range].power;

            mainChart.data.datasets[1].data =
                chartData[range].occupancy;

            mainChart.update();

        }
    );
});

/* ========================= */
/* SIDEBAR NAVIGATION */
/* ========================= */

const navItems =
    document.querySelectorAll(
        ".nav-item"
    );

navItems.forEach(item => {

    item.addEventListener(
        "click",
        () => {

            navItems.forEach(nav =>
                nav.classList.remove(
                    "active"
                )
            );

            item.classList.add(
                "active"
            );

            const targetId =
                item.dataset.target;

            if (!targetId) return;

            const section =
                document.getElementById(
                    targetId
                );

            if (!section) return;

            section.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );
});

/* ========================= */
/* LIVE COUNTER ANIMATION */
/* ========================= */

const counters =
    document.querySelectorAll(
        ".counter"
    );

counters.forEach(counter => {

    const target =
        Number(
            counter.dataset.target
        );

    const suffix =
        counter.dataset.suffix || "";

    let current = 0;

    const increment =
        target / 80;

    function updateCounter() {

        current += increment;

        if (current >= target) {

            counter.innerText =
                target + suffix;

            return;
        }

        if (target % 1 !== 0) {

            counter.innerText =
                current.toFixed(2)
                + suffix;

        } else {

            counter.innerText =
                Math.floor(current)
                + suffix;
        }

        requestAnimationFrame(
            updateCounter
        );
    }

    updateCounter();

});

const speedSlider =
    document.getElementById(
        "speedRange"
    );

let simulationSpeed = 3000;
let datasetMemory = [];

/* ========================= */
/* REALTIME SIMULATION */
/* ========================= */

function randomFloat(min, max) {

    return (
        Math.random() * (max - min)
        + min
    ).toFixed(2);

}

function randomInt(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;

}

function realtimeSimulationLoop() {

    /* ========================= */
    /* UPDATE METRICS */
    /* ========================= */

    let powerMin = 1.8;
    let powerMax = 3.2;

    let occupancyMin = 2;
    let occupancyMax = 10;

    let devicesMin = 20;
    let devicesMax = 30;

    /* ========================= */
    /* PRESET LOGIC */
    /* ========================= */

    if (activePreset === "High Occupancy") {

        powerMin = 2.8;
        powerMax = 4.2;

        occupancyMin = 7;
        occupancyMax = 12;

        devicesMin = 28;
        devicesMax = 40;
    }

    if (activePreset === "Energy Saving") {

        powerMin = 0.8;
        powerMax = 1.6;

        occupancyMin = 2;
        occupancyMax = 5;

        devicesMin = 10;
        devicesMax = 20;
    }

    if (activePreset === "Power Spike") {

        powerMin = 3.5;
        powerMax = 5.5;

        occupancyMin = 4;
        occupancyMax = 8;

        devicesMin = 25;
        devicesMax = 38;
    }

    if (activePreset === "Rainy Environment") {

        powerMin = 1.5;
        powerMax = 2.5;

        occupancyMin = 1;
        occupancyMax = 4;

        devicesMin = 18;
        devicesMax = 26;
    }

    const power =
        randomFloat(
            powerMin,
            powerMax
        );

    const occupancy =
        randomInt(
            occupancyMin,
            occupancyMax
        );

    const devices =
        randomInt(
            devicesMin,
            devicesMax
        );

    document.getElementById(
        "powerValue"
    ).innerText =
        power + " kW";

    document.getElementById(
        "occupancyValue"
    ).innerText =
        occupancy + " People";

    document.getElementById(
        "deviceValue"
    ).innerText =
        devices;

    /* ========================= */
    /* DATASET MEMORY */
    /* ========================= */

    datasetMemory.push({

        timestamp:
            new Date().toISOString(),

        preset:
            activePreset,

        power:
            Number(power),

        occupancy:
            occupancy,

        devices:
            devices,

        temperature:
            tempValue.textContent,

        humidity:
            humidityValue.textContent,

        aqi:
            aqiValue.textContent,

        co2:
            co2Value.textContent
    });

    /* LIMIT MEMORY */

    if (datasetMemory.length > 500) {

        datasetMemory.shift();

    }

    /* ========================= */
    /* UPDATE DEVICE POWER */
    /* ========================= */

    document.getElementById(
        "fanPower"
    ).innerText =
        randomInt(60, 90) + "W";

    document.getElementById(
        "lampPower"
    ).innerText =
        randomInt(8, 20) + "W";

    document.getElementById(
        "chargerPower"
    ).innerText =
        randomInt(40, 80) + "W";

    /* ========================= */
    /* UPDATE CHART */
    /* ========================= */

    mainChart.data.datasets[0]
        .data.shift();

    mainChart.data.datasets[0]
        .data.push(
            Number(
                randomFloat(1.0, 3.0)
            )
        );

    mainChart.data.datasets[1]
        .data.shift();

    mainChart.data.datasets[1]
        .data.push(
            randomInt(2, 10)
        );

    mainChart.update();

    setTimeout(
        realtimeSimulationLoop,
        simulationSpeed
    );
}

realtimeSimulationLoop();

/* ========================= */
/* CONNECTION STATUS */
/* ========================= */

const connectionStatus =
    document.getElementById(
        "connectionStatus"
    );

const statusMessages = [

    "MQTT Connected",

    "Realtime Stream Active",

    "Broker Synced",

    "Receiving Sensor Data"

];

let statusIndex = 0;

setInterval(() => {

    statusIndex++;

    if (
        statusIndex >=
        statusMessages.length
    ) {
        statusIndex = 0;
    }

    connectionStatus.textContent =
        statusMessages[statusIndex];

}, 4000);

/* ========================= */
/* TOAST NOTIFICATION */
/* ========================= */

const toastContainer =
    document.getElementById(
        "toastContainer"
    ) || document.body;

const presetToasts = {

    "Normal Day": [

        {
            title: "Telemetry Stable",
            message:
                "Realtime monitoring operating normally"
        },

        {
            title: "MQTT Connected",
            message:
                "Broker synchronization successful"
        },

        {
            title: "Environment Stable",
            message:
                "Temperature and humidity within threshold"
        }
    ],

    "High Occupancy": [

        {
            title: "Occupancy Surge",
            message:
                "Realtime occupancy increased significantly"
        },

        {
            title: "Cooling Demand",
            message:
                "Fan system escalated to high performance"
        },

        {
            title: "Power Usage Rising",
            message:
                "Energy consumption exceeded baseline"
        }
    ],

    "Energy Saving": [

        {
            title: "Eco Mode Enabled",
            message:
                "Non-critical systems switched to standby"
        },

        {
            title: "Optimization Active",
            message:
                "Smart energy-saving policy applied"
        },

        {
            title: "Low Power State",
            message:
                "Consumption reduced successfully"
        }
    ],

    "Power Spike": [

        {
            title: "Voltage Instability",
            message:
                "Power fluctuation detected on charger node"
        },

        {
            title: "Critical Spike",
            message:
                "Realtime consumption exceeded safe threshold"
        },

        {
            title: "Load Redistribution",
            message:
                "Emergency balancing process activated"
        }
    ],

    "Rainy Environment": [

        {
            title: "Humidity Elevated",
            message:
                "Ambient moisture increased significantly"
        },

        {
            title: "Climate Adjustment",
            message:
                "Realtime humidity compensation enabled"
        },

        {
            title: "Condensation Prevention",
            message:
                "Moisture stabilization system active"
        }
    ]
};

function createToast() {

    const activeToastSet =
        presetToasts[activePreset];

    const data =
        activeToastSet[
        Math.floor(
            Math.random() *
            activeToastSet.length
        )
        ];

    const toast =
        document.createElement(
            "div"
        );

    toast.className = "toast";

    toast.innerHTML = `
        <div class="toast-title">
            ${data.title}
        </div>

        <div class="toast-message">
            ${data.message}
        </div>
    `;

    toastContainer.appendChild(
        toast
    );

    setTimeout(() => {

        toast.style.opacity = "0";

        toast.style.transform =
            "translateX(40px)";

        toast.style.transition =
            "0.4s ease";

        setTimeout(() => {

            toast.remove();

        }, 400);

    }, 4500);
}

/* AUTO RANDOM TOAST */

setInterval(() => {

    if (Math.random() > 0.4) {

        createToast();

    }

}, 8000);

const presetChartData = {

    "Normal Day": {
        power: [
            2.0, 2.4, 2.5, 2.1,
            1.2, 1.7, 2.3, 1.5,
            2.0, 1.9, 1.7, 2.6,
            1.3, 2.2, 1.2, 1.1,
            1.2, 1.4, 1.2, 1.0,
            0.9, 0.7, 0.8, 0.6
        ],

        occupancy: [
            7, 4, 6, 5,
            2, 5, 7, 7,
            3, 3, 6, 5,
            7, 7, 2, 5,
            6, 3, 4, 5,
            6, 6, 7, 7
        ]
    },

    "High Occupancy": {
        power: [
            2.8, 2.9, 3.0, 2.7,
            2.6, 3.1, 3.2, 2.9,
            3.0, 3.1, 2.8, 3.2,
            3.0, 2.9, 3.1, 3.0,
            2.8, 2.9, 3.0, 3.2,
            3.1, 3.0, 2.9, 3.2
        ],

        occupancy: [
            8, 9, 10, 9,
            8, 10, 10, 9,
            8, 9, 10, 10,
            9, 8, 10, 9,
            8, 9, 10, 10,
            9, 8, 10, 10
        ]
    },

    "Energy Saving": {
        power: [
            1.0, 1.1, 1.2, 1.0,
            0.9, 1.0, 1.1, 1.0,
            1.2, 1.1, 1.0, 1.2,
            1.1, 1.0, 1.1, 1.0,
            0.9, 1.0, 1.1, 1.0,
            0.8, 0.9, 1.0, 0.9
        ],

        occupancy: [
            3, 4, 3, 4,
            3, 4, 3, 4,
            3, 4, 3, 4,
            3, 4, 3, 4,
            3, 4, 3, 4,
            3, 4, 3, 4
        ]
    },

    "Power Spike": {
        power: [
            1.5, 2.0, 3.5, 2.8,
            3.6, 2.9, 3.4, 2.7,
            3.8, 2.9, 3.7, 3.2,
            2.8, 3.5, 3.1, 3.0,
            2.9, 3.8, 3.3, 2.9,
            3.6, 3.2, 3.7, 3.5
        ],

        occupancy: [
            4, 5, 4, 5,
            4, 5, 4, 5,
            4, 5, 4, 5,
            4, 5, 4, 5,
            4, 5, 4, 5,
            4, 5, 4, 5
        ]
    },

    "Rainy Environment": {
        power: [
            1.7, 1.8, 1.9, 1.7,
            1.8, 1.9, 2.0, 1.8,
            1.9, 2.0, 1.8, 1.9,
            2.0, 1.8, 1.9, 1.8,
            1.7, 1.8, 1.9, 2.0,
            1.8, 1.9, 2.0, 1.8
        ],

        occupancy: [
            2, 3, 2, 3,
            2, 3, 2, 3,
            2, 3, 2, 3,
            2, 3, 2, 3,
            2, 3, 2, 3,
            2, 3, 2, 3
        ]
    }
};

/* ========================= */
/* AI INSIGHT */
/* ========================= */

const presetInsights = {

    "Normal Day": {
        title: "Environment stable",
        description: "Temperature and humidity currently operating within optimal threshold range."
    },

    "High Occupancy": {
        title: "Occupancy spike detected",
        description: "Power usage increased due to elevated occupancy and cooling demand."
    },

    "Energy Saving": {
        title: "Energy optimization active",
        description: "System reduced non-critical consumption and switched devices into eco mode."
    },

    "Power Spike": {
        title: "Abnormal energy surge",
        description: "Sudden increase detected on power distribution line."
    },

    "Rainy Environment": {
        title: "Humidity level elevated",
        description: "Moisture and ambient humidity increased due to weather simulation."
    }
};

const aiTitle =
    document.getElementById(
        "aiTitle"
    );

const aiDescription =
    document.getElementById(
        "aiDescription"
    );

const aiInsights = [

    {
        title:
            "Power usage increasing",

        description:
            "Energy consumption increased during high occupancy period. Cooling devices contributing 28% additional load."
    },

    {
        title:
            "Environment stable",

        description:
            "Temperature and humidity currently operating within optimal threshold range."
    },

    {
        title:
            "Occupancy pattern detected",

        description:
            "Peak occupancy detected during evening cycle with consistent environmental fluctuation."
    },

    {
        title:
            "Anomaly probability low",

        description:
            "Sensor activity currently aligned with expected realtime operational behavior."
    },

    {
        title:
            "Smart cooling recommended",

        description:
            "High temperature trend detected. Eco cooling optimization recommended."
    }
];

function updateAIInsight() {

    const randomInsight =
        aiInsights[
        Math.floor(
            Math.random() *
            aiInsights.length
        )
        ];

    aiTitle.textContent =
        randomInsight.title;

    aiDescription.textContent =
        randomInsight.description;
}

updateAIInsight();

setInterval(
    updateAIInsight,
    7000
);

/* ========================= */
/* ANOMALY DETECTION */
/* ========================= */

const presetAnomalies = {

    "Normal Day": [
        {
            title: "Occupancy fluctuation",
            description:
                "Minor occupancy variation detected during monitoring cycle.",
            severity: "LOW"
        },

        {
            title: "Sensor latency detected",
            description:
                "Telemetry response delay detected from environment node.",
            severity: "LOW"
        }
    ],

    "High Occupancy": [
        {
            title: "Cooling overload risk",
            description:
                "Fan system operating near maximum thermal threshold.",
            severity: "HIGH"
        },

        {
            title: "Occupancy surge detected",
            description:
                "Unexpected occupancy increase detected within short interval.",
            severity: "MEDIUM"
        }
    ],

    "Energy Saving": [
        {
            title: "Eco mode stabilization",
            description:
                "Low power operational mode active across multiple devices.",
            severity: "LOW"
        }
    ],

    "Power Spike": [
        {
            title: "Critical power spike",
            description:
                "Abnormal voltage fluctuation detected on smart charger node.",
            severity: "HIGH"
        },

        {
            title: "Power instability",
            description:
                "Realtime consumption variance exceeded safe threshold.",
            severity: "MEDIUM"
        }
    ],

    "Rainy Environment": [
        {
            title: "Humidity threshold exceeded",
            description:
                "Ambient humidity crossed operational comfort threshold.",
            severity: "HIGH"
        },

        {
            title: "Condensation risk",
            description:
                "Moisture accumulation probability increased significantly.",
            severity: "MEDIUM"
        }
    ]
};

const anomalyList =
    document.getElementById(
        "anomalyList"
    );

const anomalyData = [

    {
        title:
            "Sudden power spike",

        description:
            "Unexpected increase detected on smart charger consumption pattern.",

        severity:
            "MEDIUM"
    },

    {
        title:
            "Occupancy fluctuation",

        description:
            "Rapid occupancy transition detected within short interval.",

        severity:
            "LOW"
    },

    {
        title:
            "Humidity threshold exceeded",

        description:
            "Humidity crossed recommended operational threshold.",

        severity:
            "HIGH"
    },

    {
        title:
            "Sensor latency detected",

        description:
            "Delayed telemetry response detected from environment node.",

        severity:
            "LOW"
    },

    {
        title:
            "Temperature instability",

        description:
            "Temperature variance exceeded expected baseline behavior.",

        severity:
            "MEDIUM"
    }
];

function renderAnomalies() {

    anomalyList.innerHTML = "";

    const activeAnomalySet =
        presetAnomalies[activePreset];

    activeAnomalySet.forEach(item => {

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "anomaly-item";

        div.innerHTML = `

            <h4>
                ${item.title}
            </h4>

            <p>
                ${item.description}
            </p>

            <span class="anomaly-severity">
                ${item.severity}
            </span>
        `;

        anomalyList.appendChild(div);

    });
}

renderAnomalies();

setInterval(
    renderAnomalies,
    7000
);

/* ========================= */
/* THEME SWITCHER */
/* ========================= */

const themeToggle =
    document.getElementById(
        "themeToggle"
    );

/* LOAD SAVED THEME */

const savedTheme =
    localStorage.getItem(
        "dashboard-theme"
    );

if (savedTheme === "light") {

    document.body.classList.add(
        "light-theme"
    );

    themeToggle.querySelector("i")
        .className =
        "fa-solid fa-sun";
}

/* TOGGLE */

themeToggle.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light-theme"
        );

        const isLight =
            document.body.classList.contains(
                "light-theme"
            );

        const icon =
            themeToggle.querySelector("i");

        if (isLight) {

            icon.className =
                "fa-solid fa-sun";

            localStorage.setItem(
                "dashboard-theme",
                "light"
            );

        } else {

            icon.className =
                "fa-solid fa-moon";

            localStorage.setItem(
                "dashboard-theme",
                "dark"
            );
        }
    }
);

/* ========================= */
/* AUTO ACTIVE SIDEBAR */
/* ========================= */

const sections =
    document.querySelectorAll("section");

window.addEventListener(
    "scroll",
    () => {

        let current = "";

        sections.forEach(section => {

            const sectionTop =
                section.offsetTop;

            const sectionHeight =
                section.clientHeight;

            if (
                scrollY >=
                sectionTop - 200
            ) {
                current =
                    section.getAttribute("id");
            }
        });

        navItems.forEach(item => {

            item.classList.remove(
                "active"
            );

            if (
                item.dataset.target ===
                current
            ) {

                item.classList.add(
                    "active"
                );
            }
        });
    }
);

/* ========================= */
/* SYSTEM LOGS */
/* ========================= */

const logsContainer =
    document.getElementById(
        "logsContainer"
    );

const presetLogs = {

    "Normal Day": [

        "MQTT broker synchronized",

        "Realtime telemetry received",

        "Environment node connected",

        "Sensor packet acknowledged",

        "Operational threshold stabilized"
    ],

    "High Occupancy": [

        "Cooling system escalated to high load",

        "Occupancy surge detected in monitored zone",

        "Power demand increased significantly",

        "Realtime balancing process activated",

        "Environmental load threshold exceeded"
    ],

    "Energy Saving": [

        "Eco standby mode enabled",

        "Non-critical devices switched to low power",

        "Smart optimization policy applied",

        "Reduced telemetry consumption profile active",

        "Energy stabilization completed"
    ],

    "Power Spike": [

        "Voltage instability detected",

        "Critical power spike identified",

        "Emergency load redistribution active",

        "Electrical threshold exceeded",

        "High variance consumption pattern detected"
    ],

    "Rainy Environment": [

        "Humidity compensation enabled",

        "Climate stabilization active",

        "Condensation prevention running",

        "Environmental moisture threshold elevated",

        "Realtime atmospheric adjustment synchronized"
    ]
};

function generateLog() {

    const now =
        new Date();

    const time =
        now.toLocaleTimeString();

    const activeLogs =
        presetLogs[activePreset];

    const randomMessage =
        activeLogs[
        Math.floor(
            Math.random() *
            activeLogs.length
        )
        ];

    const log =
        document.createElement(
            "div"
        );

    log.className =
        "log-item";

    log.innerHTML = `
        <span class="log-time">
            [${time}]
        </span>

        ${randomMessage}
    `;

    logsContainer.prepend(log);

    if (
        logsContainer.children.length > 12
    ) {

        logsContainer.lastChild.remove();
    }
}

generateLog();

setInterval(
    generateLog,
    4000
);

/* ========================= */
/* MINI SPARKLINE CHARTS */
/* ========================= */

function createMiniChart(
    id,
    color
) {

    const ctx =
        document
            .getElementById(id)
            .getContext("2d");

    const data =
        Array.from(
            { length: 12 },
            () =>
                Math.random() * 100
        );

    return new Chart(ctx, {

        type: "line",

        data: {

            labels:
                data.map((_, i) => i),

            datasets: [

                {
                    data,

                    borderColor:
                        color,

                    borderWidth: 2,

                    tension: 0.5,

                    fill: false,

                    pointRadius: 0
                }
            ]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },

            scales: {

                x: {
                    display: false
                },

                y: {
                    display: false
                }
            }
        }
    });
}

const powerMiniChart =
    createMiniChart(
        "powerMiniChart",
        "#00c2ff"
    );

const deviceMiniChart =
    createMiniChart(
        "deviceMiniChart",
        "#9b5cff"
    );

const occupancyMiniChart =
    createMiniChart(
        "occupancyMiniChart",
        "#00ff99"
    );

function updateMiniChart(chart) {

    chart.data.datasets[0]
        .data.shift();

    chart.data.datasets[0]
        .data.push(
            Math.random() * 100
        );

    chart.update();
}

setInterval(() => {

    updateMiniChart(
        powerMiniChart
    );

    updateMiniChart(
        deviceMiniChart
    );

    updateMiniChart(
        occupancyMiniChart
    );

}, 3000);

const exportCsvBtn =
    document.getElementById(
        "exportCsvBtn"
    );

const exportJsonBtn =
    document.getElementById(
        "exportJsonBtn"
    );

const durationSelect =
    document.getElementById(
        "durationSelect"
    );

const datasetStatus =
    document.getElementById(
        "datasetStatus"
    );

speedSlider.addEventListener(
    "input",
    () => {

        const value =
            Number(
                speedSlider.value
            );

        /* SLOW */

        if (value <= 33) {

            simulationSpeed = 5000;
        }

        /* NORMAL */

        else if (value <= 66) {

            simulationSpeed = 3000;
        }

        /* FAST */

        else {

            simulationSpeed = 1200;
        }

        datasetStatus.textContent =
            `Simulation speed updated (${value}%)`;

    }
);

function generateDataset() {

    const duration =
        durationSelect.value;

    let rows = 24;

    if (duration === "Last 7 Days") {
        rows = 7;
    }

    if (duration === "Last 30 Days") {
        rows = 30;
    }

    if (duration === "Last 1 Year") {
        rows = 365;
    }

    const dataset = [];

    for (let i = 0; i < rows; i++) {

        let powerMin = 1.0;
        let powerMax = 3.0;

        let occupancyMin = 2;
        let occupancyMax = 7;

        let tempMin = 23;
        let tempMax = 28;

        let humidityMin = 45;
        let humidityMax = 60;

        let anomalyChance = 0.1;

        /* ========================= */
        /* PRESET LOGIC */
        /* ========================= */

        if (activePreset === "High Occupancy") {

            powerMin = 2.8;
            powerMax = 4.5;

            occupancyMin = 7;
            occupancyMax = 12;

            tempMin = 28;
            tempMax = 32;

            anomalyChance = 0.35;
        }

        if (activePreset === "Energy Saving") {

            powerMin = 0.8;
            powerMax = 1.5;

            occupancyMin = 1;
            occupancyMax = 4;

            tempMin = 22;
            tempMax = 26;

            anomalyChance = 0.03;
        }

        if (activePreset === "Power Spike") {

            powerMin = 3.5;
            powerMax = 6.0;

            occupancyMin = 4;
            occupancyMax = 8;

            tempMin = 26;
            tempMax = 30;

            anomalyChance = 0.55;
        }

        if (activePreset === "Rainy Environment") {

            powerMin = 1.5;
            powerMax = 2.5;

            occupancyMin = 1;
            occupancyMax = 4;

            humidityMin = 70;
            humidityMax = 90;

            anomalyChance = 0.25;
        }

        const anomalyDetected =
            Math.random() < anomalyChance;

        dataset.push({

            timestamp:
                new Date(
                    Date.now() -
                    i * 3600000
                ).toISOString(),

            preset:
                activePreset,

            power:
                randomFloat(
                    powerMin,
                    powerMax
                ),

            occupancy:
                randomInt(
                    occupancyMin,
                    occupancyMax
                ),

            temperature:
                randomFloat(
                    tempMin,
                    tempMax
                ),

            humidity:
                randomInt(
                    humidityMin,
                    humidityMax
                ),

            co2:
                randomInt(500, 900),

            anomaly:
                anomalyDetected
                    ? "TRUE"
                    : "FALSE",

            device_status:
                Math.random() > 0.2
                    ? "ACTIVE"
                    : "STANDBY"
        });
    }

    return dataset;
}

exportCsvBtn.addEventListener(
    "click",
    () => {

        const dataset =
            datasetMemory.length
                ? datasetMemory
                : generateDataset();

        const headers =
            Object.keys(dataset[0]);

        const csvRows = [

            headers.join(",")
        ];

        dataset.forEach(row => {

            const values =
                headers.map(
                    header =>
                        row[header]
                );

            csvRows.push(
                values.join(",")
            );
        });

        const csvContent =
            csvRows.join("\n");

        const blob =
            new Blob(
                [csvContent],
                { type: "text/csv" }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "iot_dataset.csv";

        link.click();

        URL.revokeObjectURL(url);

        datasetStatus.textContent =
            "CSV dataset exported successfully";

    }
);

exportJsonBtn.addEventListener(
    "click",
    () => {

        const dataset =
            datasetMemory.length
                ? datasetMemory
                : generateDataset();

        const blob =
            new Blob(
                [
                    JSON.stringify(
                        dataset,
                        null,
                        2
                    )
                ],
                {
                    type:
                        "application/json"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "iot_dataset.json";

        link.click();

        URL.revokeObjectURL(url);

        datasetStatus.textContent =
            `${dataset.length} realtime records exported`;

    }
);

/* ========================= */
/* LOADING SCREEN */
/* ========================= */

const loadingScreen =
    document.getElementById(
        "loadingScreen"
    );

const loadingProgress =
    document.getElementById(
        "loadingProgress"
    );

const loadingText =
    document.getElementById(
        "loadingText"
    );

const loadingMessages = [

    "Connecting MQTT Broker...",

    "Loading Realtime Telemetry...",

    "Preparing Analytics Engine...",

    "Synchronizing Environment Data...",

    "Launching Dashboard..."
];

let progress = 0;

const loadingInterval =
    setInterval(() => {

        progress += 20;

        loadingProgress.style.width =
            `${progress}%`;

        const index =
            Math.min(
                loadingMessages.length - 1,
                progress / 20 - 1
            );

        loadingText.textContent =
            loadingMessages[index];

        if (progress >= 100) {

            clearInterval(
                loadingInterval
            );

            setTimeout(() => {

                loadingScreen.classList.add(
                    "hidden"
                );

            }, 500);
        }

    }, 700);

presetSelect.addEventListener("change", () => {

    const selectedPreset =
        presetSelect.value;

    activePreset = selectedPreset;

    /* AI INSIGHT */

    const insight =
        presetInsights[selectedPreset];

    aiTitle.textContent =
        insight.title;

    aiDescription.textContent =
        insight.description;

    /* CHART UPDATE */

    const selectedData =
        presetChartData[selectedPreset];

    mainChart.data.datasets[0].data =
        selectedData.power;

    mainChart.data.datasets[1].data =
        selectedData.occupancy;

    mainChart.update();

});

presetSelect.addEventListener("change", () => {

    datasetStatus.textContent =
        `Generating ${presetSelect.value} dataset...`;

});

exportJsonBtn.addEventListener(
    "click",
    () => {

        const dataStr =
            JSON.stringify(
                datasetMemory,
                null,
                2
            );

        const blob =
            new Blob(
                [dataStr],
                {
                    type:
                        "application/json"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href = url;

        link.download =
            `iot-dataset-${Date.now()}.json`;

        link.click();

        URL.revokeObjectURL(
            url
        );

        createToastCustom(
            "Dataset Exported",
            "JSON dataset generated successfully"
        );

    }
);

/* ========================= */
/* CUSTOM TOAST */
/* ========================= */

function createToastCustom(
    title,
    message
) {

    if (!toastContainer) return;

    const toast =
        document.createElement(
            "div"
        );

    toast.className = "toast";

    toast.innerHTML = `
        <div class="toast-title">
            ${title}
        </div>

        <div class="toast-message">
            ${message}
        </div>
    `;

    toastContainer.appendChild(
        toast
    );

    setTimeout(() => {

        toast.style.opacity = "0";

        toast.style.transform =
            "translateX(40px)";

        setTimeout(() => {

            toast.remove();

        }, 400);

    }, 3500);
}

window.addEventListener(
    "load",
    () => {

        setTimeout(() => {

            loadingScreen.classList.add(
                "hidden"
            );

        }, 1800);

    }
);