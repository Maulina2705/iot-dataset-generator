import pandas as pd
import numpy as np
import random

# generate timestamp
timestamps = pd.date_range(start="2026-01-01", periods=100, freq="H")

data = []

for i, t in enumerate(timestamps):
    temp = 25 + 5 * np.sin(2 * np.pi * i / 24)
    temp += random.uniform(-0.5, 0.5)

    humidity = 60 + random.uniform(-5, 5)

    data.append({
        "device_id": "esp32_01",
        "timestamp": str(t),
        "temperature": round(temp, 2),
        "humidity": round(humidity, 2),
        "motion": random.randint(0, 1)
    })

df = pd.DataFrame(data)
df.to_csv("data/dataset.csv", index=False)

print("Dataset generated!")
