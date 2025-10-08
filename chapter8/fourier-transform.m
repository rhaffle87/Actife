% fourier_transform_examples.m
% Verify Fourier transforms symbolically (based on textbook Example 15)

syms t w                         % symbolic variables

%% (1) Fourier Transform of constant 1
f1 = 1;
F1 = fourier(f1, t, w);

disp('Fourier Transform of f(t) = 1 :');
pretty(F1)
% Expected result: 2*pi*dirac(w)

%% (2) Fourier Transform of Gaussian e^(-t^2)
f2 = exp(-t^2);
F2 = fourier(f2, t, w);

disp('Fourier Transform of f(t) = e^{-t^2} :');
pretty(F2)
% Expected result: sqrt(pi)*exp(-w^2/4)

%% (3) Visualization (optional)
% Numeric visualization of Gaussian and its transform
t_vals = linspace(-5,5,500);
f_vals = exp(-t_vals.^2);

% Analytical transform result
F_vals = sqrt(pi) * exp(-(t_vals.^2)/4);

figure;
subplot(1,2,1);
plot(t_vals, f_vals, 'LineWidth',1.5); grid on;
title('f(t) = e^{-t^2}');
xlabel('t'); ylabel('Amplitude');

subplot(1,2,2);
plot(t_vals, F_vals, 'r','LineWidth',1.5); grid on;
title('Fourier Transform F(ω) = √π e^{−ω²/4}');
xlabel('ω'); ylabel('Amplitude');
