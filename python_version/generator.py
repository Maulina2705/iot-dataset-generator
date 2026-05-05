import pandas as pd
import numpy as np
import random

# konfigurasi
NUM_DATA = 500
ANOMALY_PROB = 0.02

# waktu
timestamps = pd.date_range(start="2026-01-01", periods=NUM_DATA, freq="h")

data = []

def generate_temperature(i):
    # pola harian (siang panas, malam dingin)
    base = 25 + 5 * np.sin(2 * np.pi * i / 24)

    # noise kecil
    noise = np.random.normal(0, 0.5)

    value = base + noise

    # anomaly (lonjakan suhu)
    if random.random() < ANOMALY_PROB:
        value += random.uniform(10, 20)

    return round(value, 2)


def generate_humidity(i):
    # kebalikan suhu
    base = 70 - 10 * np.sin(2 * np.pi * i / 24)

    noise = np.random.normal(0, 2)

    value = base + noise

    # anomaly (drop / spike)
    if random.random() < ANOMALY_PROB:
        value += random.uniform(-20, 20)

    return round(value, 2)


def generate_motion():
    # lebih sering 0 (tidak ada gerakan)
    return 1 if random.random() < 0.1 else 0


for i, t in enumerate(timestamps):
    data.append({
        "device_id": f"esp32_{random.randint(1,3)}",
        "timestamp": str(t),
        "temperature": generate_temperature(i),
        "humidity": generate_humidity(i),
        "motion": generate_motion()
    })


df = pd.DataFrame(data)
df.to_csv("data/dataset.csv", index=False)

print("Dataset realistic generated!")