import { getImageTensorFromPath, tensorToImageData } from './imageHelper';
import { runNeuralStyleTransfer } from './modelHelper';

export async function inferenceNeuralStyleTransfer(path: string): Promise<[ImageData, number]> {
    try {
        console.log('Starting neural style transfer inference ...');
        const imageTensor = await getImageTensorFromPath(path);
        console.log('Image tensor created:', imageTensor.dims);
        const [outputTensor, inferenceTime] = await runNeuralStyleTransfer(imageTensor);
        console.log('Model inference completed in', inferenceTime, 'seconds');

        const outputImageData = tensorToImageData(outputTensor, 256, 256);
        console.log('Output converted to ImageData');

        return [outputImageData, inferenceTime];

    } catch (error) {
        console.error('Neural style transfer inference failed:', error);
        throw error;
    }
}

export { inferenceNeuralStyleTransfer as inferenceNST };