import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("data/dataset.csv")

plt.figure()
plt.plot(df["temperature"])
plt.title("Temperature Over Time")
plt.show()