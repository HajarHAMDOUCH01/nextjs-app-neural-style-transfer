"use client"
import { useRef, useState } from 'react';
import { inferenceNeuralStyleTransfer } from '../utils/predict';
import styles from '../styles/Home.module.css';

interface Props {
  height: number;
  width: number;
}

const ImageCanvas = (props: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [inferenceTime, setInferenceTime] = useState("");
  const [error, setError] = useState("");

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      displayImageAndRunInference(imageUrl);
    };
    reader.readAsDataURL(file);
  };

  const displayImageAndRunInference = (imageSrc: string) => {
    const image = new Image();
    image.src = imageSrc;
    
    setIsProcessing(true);
    setInferenceTime("Processing...");
    setError("");

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    image.onload = () => {
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, props.width, props.height);
      }
      
      // Run neural style transfer
      submitInference(imageSrc);
    };

    image.onerror = () => {
      setError("Failed to load image");
      setIsProcessing(false);
    };
  };

  const submitInference = async (imageSrc: string) => {
    try {
      console.log('Starting inference with image:', imageSrc);
      
      // Run neural style transfer
      const [outputImageData, inferenceTime] = await inferenceNeuralStyleTransfer(imageSrc);
      
      // Display the stylized image
      const outputCanvas = outputCanvasRef.current;
      const outputCtx = outputCanvas?.getContext('2d');
      
      if (outputCtx && outputCanvas) {
        outputCtx.putImageData(outputImageData, 0, 0);
      }
      
      setInferenceTime(`Style transfer completed in ${inferenceTime.toFixed(2)} seconds`);
      setIsProcessing(false);
      
    } catch (err) {
      console.error('Inference error:', err);
      setError(`Inference failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsProcessing(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.container}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />
      
      <button
        className={styles.button}
        onClick={triggerFileSelect}
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Select Image for Style Transfer'}
      </button>
      
      <div className={styles.imageContainer}>
        <div className={styles.imageSection}>
          <h3>Original Image</h3>
          <canvas 
            ref={canvasRef} 
            width={props.width} 
            height={props.height}
            className={styles.canvas}
          />
        </div>
        
        <div className={styles.imageSection}>
          <h3>Stylized Image</h3>
          <canvas 
            ref={outputCanvasRef} 
            width={props.width} 
            height={props.height}
            className={styles.canvas}
          />
        </div>
      </div>
      
      {inferenceTime && <div className={styles.info}>{inferenceTime}</div>}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default ImageCanvas;