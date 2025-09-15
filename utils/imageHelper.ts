import { Tensor } from 'onnxruntime-web';

export async function getImageTensorFromPath(path: string, dims: number[] = [1, 3, 256, 256]): Promise<Tensor> {
    const imageData = await loadImageFromPath(path, dims[2], dims[3]);
    const imageTensor = imageDataToTensor(imageData, dims);
    return imageTensor;
}

async function loadImageFromPath(path: string, width: number = 256, height: number = 256): Promise<ImageData> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; 
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and resize image
                ctx.drawImage(img, 0, 0, width, height);
                
                const imageData = ctx.getImageData(0, 0, width, height);
                resolve(imageData);
                
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = () => {
            reject(new Error(`Failed to load image: ${path}`));
        };
        
        img.src = path;
    });
}

function imageDataToTensor(imageData: ImageData, dims: number[]): Tensor {
    const data = imageData.data; // RGBA format
    const [batchSize, channels, height, width] = dims;
    
    const float32Data = new Float32Array(batchSize * channels * height * width);
    const channelSize = height * width;
    
    for (let i = 0; i < channelSize; i++) {
        const pixelIndex = i * 4; // RGBA stride
        
        // Normalize from [0, 255] to [0, 1]
        float32Data[i] = data[pixelIndex] / 255.0;                    // Red channel
        float32Data[i + channelSize] = data[pixelIndex + 1] / 255.0;  // Green channel  
        float32Data[i + 2 * channelSize] = data[pixelIndex + 2] / 255.0; // Blue channel
    }

    const inputTensor = new Tensor("float32", float32Data, dims);
    return inputTensor;
}

// Converting the output tensor back to displayable image
export function tensorToImageData(tensor: Tensor, width: number = 256, height: number = 256): ImageData {
    const data = tensor.data as Float32Array;
    const imageData = new ImageData(width, height);
    const pixels = imageData.data;

    // Tensor format: [C, H, W] where C=3 (RGB)
    const channelSize = width * height;
    
    for (let i = 0; i < channelSize; i++) {
        const pixelIndex = i * 4; // RGBA format
        
        // Extract RGB values from tensor and clamp to valid range
        const r = Math.min(255, Math.max(0, Math.round(data[i] * 255)));
        const g = Math.min(255, Math.max(0, Math.round(data[i + channelSize] * 255)));
        const b = Math.min(255, Math.max(0, Math.round(data[i + 2 * channelSize] * 255)));
        
        pixels[pixelIndex] = r;       // Red
        pixels[pixelIndex + 1] = g;   // Green  
        pixels[pixelIndex + 2] = b;   // Blue
        pixels[pixelIndex + 3] = 255; // Alpha (fully opaque)
    }
    
    return imageData;
}

export function debugTensor(tensor: Tensor, name: string = "tensor") {
    const data = tensor.data as Float32Array;
    const min = Math.min(...Array.from(data));
    const max = Math.max(...Array.from(data));
    const mean = Array.from(data).reduce((a, b) => a + b, 0) / data.length;
    
    console.log(`${name} - Shape: [${tensor.dims}], Range: [${min.toFixed(4)}, ${max.toFixed(4)}], Mean: ${mean.toFixed(4)}`);
}