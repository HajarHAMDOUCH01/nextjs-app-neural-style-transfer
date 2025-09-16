"use client"
import { useRef, useState } from "react"
import type React from "react"

import { inferenceNeuralStyleTransfer } from "../utils/predict"
import styles from "../styles/Home.module.css"

interface Props {
  height: number
  width: number
}

const ImageCanvas = (props: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const outputCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isProcessing, setIsProcessing] = useState(false)
  const [inferenceTime, setInferenceTime] = useState("")
  const [error, setError] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("Van Gogh")
  const [showStyleList, setShowStyleList] = useState(false)

  const stylesList = ["Van Gogh", "Picasso", "Monet", "Abstract", "Oil Painting", "Watercolor", "Pop Art", "Anime"]

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      displayImageAndRunInference(imageUrl)
    }
    reader.readAsDataURL(file)
  }

  const displayImageAndRunInference = (imageSrc: string) => {
    const image = new Image()
    image.src = imageSrc

    setIsProcessing(true)
    setInferenceTime("Processing...")
    setError("")

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")

    image.onload = () => {
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(image, 0, 0, props.width, props.height)
      }

      // Run neural style transfer
      submitInference(imageSrc)
    }

    image.onerror = () => {
      setError("Failed to load image")
      setIsProcessing(false)
    }
  }

  const submitInference = async (imageSrc: string) => {
    try {
      console.log("Starting inference with image:", imageSrc)

      // Run neural style transfer
      const [outputImageData, inferenceTime] = await inferenceNeuralStyleTransfer(imageSrc)

      const outputCanvas = outputCanvasRef.current
      const outputCtx = outputCanvas?.getContext("2d")

      if (outputCtx && outputCanvas) {
        // Clear the canvas first
        outputCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height)

        // Create a temporary canvas to hold the image data
        const tempCanvas = document.createElement("canvas")
        const tempCtx = tempCanvas.getContext("2d")

        if (tempCtx) {
          tempCanvas.width = outputImageData.width
          tempCanvas.height = outputImageData.height
          tempCtx.putImageData(outputImageData, 0, 0)

          // Scale and draw the image to fit the output canvas
          outputCtx.drawImage(tempCanvas, 0, 0, props.width, props.height)
        }
      }

      setInferenceTime(`Transformation completed in ${inferenceTime.toFixed(2)} seconds`)
      setIsProcessing(false)
    } catch (err) {
      console.error("Inference error:", err)
      setError(`Processing failed: ${err instanceof Error ? err.message : "Unknown error"}`)
      setIsProcessing(false)
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Fast Neural Style Transfer</h1>
        <p className={styles.subtitle}>Transform your images with AI-powered artistic styles</p>
      </div>

      <div className={styles.controlsContainer}>
        <div className={styles.styleSelector}>
          <button
            className={styles.styleButton}
            onMouseEnter={() => setShowStyleList(true)}
            onMouseLeave={() => setShowStyleList(false)}
          >
            <span className={styles.buttonText}>Style: {selectedStyle}</span>
            <span className={styles.dropdownArrow}>▼</span>
          </button>

          {showStyleList && (
            <div
              className={styles.styleList}
              onMouseEnter={() => setShowStyleList(true)}
              onMouseLeave={() => setShowStyleList(false)}
            >
              {stylesList.map((style) => (
                <button
                  key={style}
                  className={`${styles.styleOption} ${selectedStyle === style ? styles.styleOptionActive : ""}`}
                  onClick={() => {
                    setSelectedStyle(style)
                    setShowStyleList(false)
                  }}
                >
                  {style}
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          style={{ display: "none" }}
        />

        <button className={styles.button} onClick={triggerFileSelect} disabled={isProcessing}>
          <span className={styles.buttonText}>{isProcessing ? "Processing..." : "Select Image"}</span>
        </button>
      </div>

      <div className={styles.imageContainer}>
        <div className={styles.imageSection}>
          <div className={styles.sectionHeader}>
            <h3>Original Image</h3>
          </div>
          <div className={styles.canvasWrapper}>
            <canvas ref={canvasRef} width={props.width} height={props.height} className={styles.canvas} />
          </div>
        </div>

        <div className={styles.arrow}>
          <span className={styles.arrowIcon}>→</span>
        </div>

        <div className={styles.imageSection}>
          <div className={styles.sectionHeader}>
            <h3>Stylized Result</h3>
          </div>
          <div className={styles.canvasWrapper}>
            <canvas ref={outputCanvasRef} width={props.width} height={props.height} className={styles.canvas} />
          </div>
        </div>
      </div>

      {inferenceTime && <div className={styles.info}>{inferenceTime}</div>}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  )
}

export default ImageCanvas
