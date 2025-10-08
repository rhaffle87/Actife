#include <stdio.h>
#include <math.h>

#define N 8
#define PI 3.14159265358979323846

void dct_1d(double x[], double X[]) {
    for (int u = 0; u < N; u++) {
        double alpha = (u == 0) ? sqrt(1.0 / N) : sqrt(2.0 / N);
        X[u] = 0.0;
        for (int i = 0; i < N; i++) {
            X[u] += x[i] * cos(PI * (2 * i + 1) * u / (2.0 * N));
        }
        X[u] *= alpha;
    }
}

void idct_1d(double X[], double x[]) {
    for (int i = 0; i < N; i++) {
        x[i] = 0.0;
        for (int u = 0; u < N; u++) {
            double alpha = (u == 0) ? sqrt(1.0 / N) : sqrt(2.0 / N);
            x[i] += alpha * X[u] * cos(PI * (2 * i + 1) * u / (2.0 * N));
        }
    }
}

int main() {
    double x[N] = {1, 2, 3, 4, 4, 3, 2, 1};
    double X[N], xr[N];

    dct_1d(x, X);
    idct_1d(X, xr);

    printf("Input x:\n");
    for (int i = 0; i < N; i++) printf("%6.2f ", x[i]);
    printf("\n\nDCT X:\n");
    for (int i = 0; i < N; i++) printf("%8.4f ", X[i]);
    printf("\n\nReconstructed x:\n");
    for (int i = 0; i < N; i++) printf("%6.2f ", xr[i]);
    printf("\n");

    return 0;
}
