import numpy as np
import matplotlib.pyplot as plt

# === Parameters ===
BITS = 4
L = 2 ** BITS                   # Quantization levels
SIGMA = 1.0                     # Unit variance
N = 500_000                     # Number of samples
x = np.random.randn(N) * SIGMA  # Gaussian(0, σ)

gamma_values = np.linspace(1, 6, 60)  # Loading fraction range
snr_values = np.empty_like(gamma_values)  # Preallocate for speed

signal_power = np.mean(x**2)  # Constant for all gamma

for i, gamma in enumerate(gamma_values):
    bM = gamma * SIGMA
    delta = 2 * bM / L

    # Quantization in one vectorized line
    xq = np.clip(x, -bM, bM - delta)
    q_index = np.floor((xq + bM) / delta)
    xq = (q_index + 0.5) * delta - bM

    # Compute SNR efficiently
    noise_power = np.mean((x - xq) ** 2)
    snr_values[i] = 10 * np.log10(signal_power / noise_power)

# === Find optimal parameters ===
opt_idx = np.argmax(snr_values)
gamma_opt = gamma_values[opt_idx]
bM_opt = gamma_opt * SIGMA
delta_opt = 2 * bM_opt / L
snr_opt = snr_values[opt_idx]

# === Plot ===
plt.figure(figsize=(7, 5))
plt.plot(gamma_values, snr_values, lw=2, color='black')
plt.plot(gamma_opt, snr_opt, 'ro', label=f'Max SNR = {snr_opt:.2f} dB')
plt.title(f'SNR vs Loading Fraction for {BITS}-bit Uniform Quantizer')
plt.xlabel('Loading Fraction (γ = bM / σ)')
plt.ylabel('SNR (dB)')
plt.grid(ls='--', alpha=0.6)
plt.legend()
plt.tight_layout()
plt.show()

# === Results ===
print(f"Optimal γ*  = {gamma_opt:.3f}")
print(f"Optimal bM* = {bM_opt:.3f}")
print(f"Optimal Δ*  = {delta_opt:.5f}")
print(f"Maximum SNR = {snr_opt:.2f} dB")