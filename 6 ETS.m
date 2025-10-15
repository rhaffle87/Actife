% Membaca citra
x = imread('nama_citra.jpg');

% Ambil salah satu komponen warna, misalnya komponen merah
x1 = x(:,:,1);    % citra grayscale dari komponen R

% Ubah ke tipe double agar bisa dihitung rata-ratanya
x1 = double(x1);

% Dapatkan ukuran citra
[M, N] = size(x1);

% Inisialisasi matriks hasil
output = zeros(M/2, N/2);

% Hitung rata-rata setiap blok 2x2
for i = 1:2:M
    for j = 1:2:N
        blok = x1(i:i+1, j:j+1);
        output((i+1)/2, (j+1)/2) = mean(blok(:));
    end
end
