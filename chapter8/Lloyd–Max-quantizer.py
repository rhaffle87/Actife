import numpy as np
from scipy.integrate import quad

# === PDF of Gaussian(0,1) ===
def fX(x):
    return (1 / np.sqrt(2 * np.pi)) * np.exp(-x**2 / 2)

# === Function to compute conditional mean (Eq. 8.13) ===
def conditional_mean(a, b):
    num, _ = quad(lambda x: x * fX(x), a, b)
    den, _ = quad(fX, a, b)
    return num / den if den != 0 else 0.0

# === Lloyd-Max Quantizer Implementation ===
def lloyd_max_gaussian(L=4, epsilon=1e-6):
    # Initial reconstruction levels y (given)
    y = np.array([-2.0, -1.0, 1.0, 2.0])
    iteration = 0

    while True:
        # Step 1: Compute boundaries (midpoints)
        b = np.zeros(L + 1)
        b[0], b[-1] = -np.inf, np.inf
        for i in range(1, L):
            b[i] = 0.5 * (y[i - 1] + y[i])

        # Step 2: Update reconstruction levels using Eq. (8.13)
        new_y = np.zeros_like(y)
        for i in range(L):
            new_y[i] = conditional_mean(b[i], b[i + 1])

        # Step 3: Compute squared error difference
        sq_error = np.sum((new_y - y)**2)
        iteration += 1

        # Display progress
        print(f"Iteration {iteration}: y = {np.round(new_y, 4)},  SE = {sq_error:.6f}")

        # Convergence check
        if sq_error < epsilon:
            break

        y = new_y

    return new_y, b, sq_error

# === Run Quantizer ===
y_final, b_final, final_error = lloyd_max_gaussian()

print("\nFinal reconstruction levels (y*):", np.round(y_final, 4))
print("Final decision boundaries (b*):", np.round(b_final, 4))
print(f"Final squared error: {final_error:.6f}")
