import numpy as np

# === Step 1: Define 1D DCT matrix generator ===
def dct_matrix(N=8):
    T = np.zeros((N, N))
    for u in range(N):
        alpha = np.sqrt(1/N) if u == 0 else np.sqrt(2/N)
        for i in range(N):
            T[u, i] = alpha * np.cos((np.pi * (2*i + 1) * u) / (2 * N))
    return T

# === Step 2: Define 2D DCT and IDCT ===
def dct2(f):
    T = dct_matrix(f.shape[0])
    return np.dot(T, np.dot(f, T.T))

def idct2(F):
    T = dct_matrix(F.shape[0])
    return np.dot(T.T, np.dot(F, T))

# === Step 3: Example 8x8 test image (any arbitrary values) ===
f = np.array([
    [52, 55, 61, 66, 70, 61, 64, 73],
    [63, 59, 55, 90, 109, 85, 69, 72],
    [62, 59, 68, 113, 144, 104, 66, 73],
    [63, 58, 71, 122, 154, 106, 70, 69],
    [67, 61, 68, 104, 126, 88, 68, 70],
    [79, 65, 60, 70, 77, 68, 58, 75],
    [85, 71, 64, 59, 55, 61, 65, 83],
    [87, 79, 69, 68, 65, 76, 78, 94]
], dtype=float)

# === Step 4: Compute DCT and IDCT ===
F = dct2(f)
f_reconstructed = idct2(F)

# === Step 5: Check accuracy ===
diff = np.abs(f - f_reconstructed)
is_lossless = np.allclose(f, f_reconstructed, atol=1e-10)

# === Step 6: Display Results ===
print("Original matrix f:\n", np.round(f, 2))
print("\nDCT coefficients F:\n", np.round(F, 4))
print("\nReconstructed f (via IDCT):\n", np.round(f_reconstructed, 2))
print("\nDifference (|f - f_reconstructed|):\n", np.round(diff, 10))
print("\nIs transformation lossless? ->", is_lossless)