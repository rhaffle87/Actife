#include <iostream>
using namespace std;

int main () {
    float val;
    float amplitude;
    float step;

    amplitude = 1.0;
    step = 0.001;

    for (val = -amplitude; val <= amplitude; val += step) {
        cout << val << " " << endl;
    }

    for (val = amplitude; val >= -amplitude; val -= step) {
        cout << val << " " << endl;
    }

    return 0;
}