import * as ort from 'onnxruntime-web';
import _ from 'lodash';

export async function runNeuralStyleTransfer(processedData: any): Promise<[any, number]>{
    const session = await ort.InferenceSession.create('/models/nst_model_onnx.onnx', { executionProviders: ['webgl', 'wasm'], graphOptimizationLevel: 'all'});
    console.log('Infeence session created');
    const [results, inferenceTime] = await runInference(session, processedData);
    return [results, inferenceTime];
}

async function runInference(session: ort.InferenceSession, processedData: any): Promise<[any, number]> {
    const start = new Date();
    const feeds: Record<string, ort.Tensor> = {};
    feeds[session.inputNames[0]] = processedData;

    console.log('Input shape : ',processedData.dims);
    console.log('Expected input name : ',session.inputNames[0]);

    try{
        const outputData = await session.run(feeds);

        const end = new Date()
        const inferenceTime = (end.getTime() - start.getTime())/1000;
        const output = outputData[session.outputNames[0]];

        console.log('Output shape:', output.dims);
        console.log('Output data type:', output.type);

        return [output, inferenceTime];
    }
    catch (error) {
        console.error('inference failed : ',error);
        throw error;
    }
}