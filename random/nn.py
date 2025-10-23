import torch
import torch.nn as nn
import torch.optim as optim
import matplotlib.pyplot as plt
import numpy as np

# 1️⃣ Generate Toy Dataset
torch.manual_seed(42)
x = torch.randn(1000, 3) * 5  # (x1, x2, x3)

# 2️⃣ Weight yang diberikan
w1 = torch.tensor([
    [1, 2, -3, 4, 5],
    [1, 0, 3, -3, 1],
    [-1, 1, 4, 1, -2]
], dtype=torch.float32)

w2 = torch.tensor([
    [1, 2, -3, 1, 2],
    [-1, 1, 3, 5, 2],
    [1, 3, 0, 4, 4],
    [-2, -3, 0, 3, 3],
    [0, 4, 2, 2, -1]
], dtype=torch.float32)

w3 = torch.tensor([[1, 0, -2, -2, 4]], dtype=torch.float32).T

# 3️⃣ Hitung output dengan fungsi aktivasi
h1 = torch.relu(x @ w1)
h2 = torch.relu(h1 @ w2)
y = torch.sigmoid(h2 @ w3).squeeze()

# 4️⃣ Split train/test
x_train, y_train = x[:800], y[:800]
x_test, y_test = x[800:], y[800:]

# 5️⃣ Definisi model NN
class SimpleNN(nn.Module):
    def __init__(self):
        super(SimpleNN, self).__init__()
        self.hidden1 = nn.Linear(3, 5)
        self.hidden2 = nn.Linear(5, 5)
        self.output = nn.Linear(5, 1)
        self.relu = nn.ReLU()
        self.sigmoid = nn.Sigmoid()
    
    def forward(self, x):
        x = self.relu(self.hidden1(x))
        x = self.relu(self.hidden2(x))
        x = self.sigmoid(self.output(x))
        return x

model = SimpleNN()

# 6️⃣ Loss & Optimizer
criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=0.01)

# 7️⃣ Training Loop
epochs = 200
losses = []

for epoch in range(epochs):
    optimizer.zero_grad()
    outputs = model(x_train)
    loss = criterion(outputs.squeeze(), y_train)
    loss.backward()
    optimizer.step()
    losses.append(loss.item())

    if (epoch+1) % 20 == 0:
        print(f"Epoch [{epoch+1}/{epochs}] - Loss: {loss.item():.6f}")

# 8️⃣ Plot Loss vs Epoch
plt.figure(figsize=(6,4))
plt.plot(losses, label='Training Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.title('Loss vs Epoch')
plt.grid(True)
plt.legend()
plt.show()

# 9️⃣ Plot sebaran data train/test dan hasil prediksi
with torch.no_grad():
    y_pred_train = model(x_train).squeeze()
    y_pred_test = model(x_test).squeeze()

plt.figure(figsize=(8,6))
plt.scatter(y_train, y_pred_train, color='blue', label='Train', alpha=0.6)
plt.scatter(y_test, y_pred_test, color='red', label='Test', alpha=0.6)
plt.plot([0,1],[0,1],'k--')
plt.xlabel('True Output')
plt.ylabel('Predicted Output')
plt.title('Prediksi vs Data Asli (Train/Test)')
plt.legend()
plt.grid(True)
plt.show()

# 🔟 Visualisasi Decision Boundary (x1-x2, x3 rata-rata)
x1_min, x1_max = x[:,0].min() - 1, x[:,0].max() + 1
x2_min, x2_max = x[:,1].min() - 1, x[:,1].max() + 1
x1_grid, x2_grid = np.meshgrid(np.linspace(x1_min, x1_max, 100),
                               np.linspace(x2_min, x2_max, 100))
x3_const = torch.tensor(x[:,2].mean().item())  # ambil rata-rata x3

# bentuk input grid
grid_input = torch.tensor(np.c_[x1_grid.ravel(), x2_grid.ravel(),
                                np.full(x1_grid.ravel().shape, x3_const)],
                                dtype=torch.float32)

with torch.no_grad():
    grid_output = model(grid_input).reshape(x1_grid.shape)

plt.figure(figsize=(8,6))
plt.contourf(x1_grid, x2_grid, grid_output, levels=50, cmap='coolwarm')
plt.colorbar(label='Output Probability')
plt.scatter(x_train[:,0], x_train[:,1], c=y_train, cmap='coolwarm', edgecolors='k', s=30, alpha=0.6, label='Train')
plt.scatter(x_test[:,0], x_test[:,1], c=y_test, cmap='coolwarm', edgecolors='k', s=30, alpha=0.6, marker='x', label='Test')
plt.title('Decision Boundary (x1 vs x2, x3 rata-rata)')
plt.xlabel('x1')
plt.ylabel('x2')
plt.legend()
plt.show()

# 1️⃣1️⃣ Print hasil State Dict
print("\nModel State Dict:")
for name, param in model.state_dict().items():
    print(f"{name}: {param.shape}")
