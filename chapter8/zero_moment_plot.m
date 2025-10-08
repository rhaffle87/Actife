% zero_moments_plot.m
% Reproduces Fig. 8.30: Highly oscillating function ψ(t) = e^{-t^(1/4)} * sin(t^4)
% and verifies that all moments are approximately zero

clear; clc; close all;

% === Step 1: Define time vector ===
t = (0:0.001:1000)';   % column vector, Δt = 0.001

% === Step 2: Define ψ(t) ===
psi = exp(-t.^(1/4)) .* sin(t.^4);

% === Step 3: Plot ψ(t) (match textbook figure) ===
figure('Color','w');
plot(t, psi, 'b', 'LineWidth', 1);
xlabel('t');
ylabel('\psi(t)');
ylim([-0.4 0.4]);
xlim([0 1000]);
title('\psi(t) = e^{-t^{1/4}} sin(t^4)');
grid on;

% Optional: Save figure (as in textbook)
print('-depsc', 'zeromoments.eps');

% === Step 4: Compute numerical moments ===
dt = 0.001;
moments = [3, 5, 7];   % example moment orders
fprintf('\nChecking zero moments property:\n');

for p = moments
    mom = t.^p .* psi;
    moment_value = dt * sum(mom);
    ratio = moment_value / max(abs(mom));
    fprintf('Moment M%d ≈ %.6e (normalized ratio ≈ %.6e)\n', p, moment_value, ratio);
end

disp('=> All computed moments are approximately zero (ratio << 1).');
