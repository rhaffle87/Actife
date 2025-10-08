function wavelet_reduction(image_file, wavelet_type, levels, threshold)
% wavelet_reduction.m
% Based on wavelet_compression.c from the textbook
%
% Performs wavelet-based image reduction (compression)
% Parameters:
%   image_file  - filename of input image (e.g. 'lena.jpg')
%   wavelet_type - wavelet family (e.g. 'haar', 'db2', 'sym4')
%   levels      - number of decomposition levels
%   threshold   - coefficient threshold (e.g. 5, 10, etc.)

    % === Step 1: Read input image ===
    I = imread(image_file);
    I = im2double(rgb2gray(I));   % convert to grayscale double [0,1]

    % === Step 2: Perform wavelet decomposition ===
    [C, S] = wavedec2(I, levels, wavelet_type);

    % === Step 3: Apply simple threshold compression ===
    C_abs = abs(C);
    C_thresholded = C .* (C_abs > threshold);  % zero out small coeffs

    % === Step 4: Reconstruct image from thresholded coefficients ===
    I_rec = waverec2(C_thresholded, S, wavelet_type);

    % === Step 5: Display results ===
    figure;
    subplot(1,3,1); imshow(I, []); title('Original Image');
    subplot(1,3,2); imshow(log(abs(reshape(C, size(C,1), 1))+1), []); title('Wavelet Coeffs (log)');
    subplot(1,3,3); imshow(I_rec, []); title('Reconstructed Image');

    % === Step 6: Compute compression statistics ===
    nonzero_original = nnz(C);
    nonzero_compressed = nnz(C_thresholded);
    compression_ratio = nonzero_original / nonzero_compressed;

    fprintf('\nWavelet Type     : %s', wavelet_type);
    fprintf('\nLevels           : %d', levels);
    fprintf('\nThreshold        : %.4f', threshold);
    fprintf('\nNonzero Coeffs   : Original = %d | After = %d', ...
        nonzero_original, nonzero_compressed);
    fprintf('\nCompression Ratio: %.2f : 1\n', compression_ratio);

    % === Step 7: Optionally save image ===
    [~, name, ~] = fileparts(image_file);
    output_name = sprintf('%s_reduced_%s_lvl%d.jpg', name, wavelet_type, levels);
    imwrite(I_rec, output_name);
end