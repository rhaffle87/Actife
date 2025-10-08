import numpy as np

def dct_matrix(N=8):
    T = np.zeros((N, N))
    for u in range(N):
        alpha = np.sqrt(1/N) if u == 0 else np.sqrt(2/N)
        for i in range(N):
            T[u, i] = alpha * np.cos((np.pi * (2*i + 1) * u) / (2 * N))
    return T

# Generate T8
N = 8
T8 = dct_matrix(N)

# Verify orthogonality
TTT = np.dot(T8, T8.T)  # T * T^T
I = np.eye(N)

# Check orthonormality numerically
is_orthogonal = np.allclose(TTT, I, atol=1e-10)

print("T8 matrix:\n", np.round(T8, 4))
print("\nT8 * T8^T:\n", np.round(TTT, 4))
print("\nIs T8 orthogonal? ->", is_orthogonal)

# Optional: verify each row has unit length and orthogonal pairs
for i in range(N):
    norm = np.linalg.norm(T8[i])
    print(f"Row {i} norm = {norm:.6f}")
