import * as faceapi from "@vladmandic/face-api";
import * as canvas from "canvas";
import path from "path";

let modelsLoaded = false;

faceapi.env.monkeyPatch({
  Canvas: canvas.Canvas,
  Image: canvas.Image,
  ImageData: canvas.ImageData,
} as any);

async function ensureModels() {
  if (modelsLoaded) return;
  const modelsPath = path.join(__dirname, "..", "..", "models", "face-api");
  await faceapi.nets.tinyFaceDetector.loadFromDisk(modelsPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
  modelsLoaded = true;
}

function base64ToBuffer(base64: string): Buffer {
  const cleaned = base64.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(cleaned, "base64");
}

export interface FaceDetectionResult {
  faceCount: number;
  confidence: number;
}

export async function detectFaces(base64Image: string): Promise<FaceDetectionResult> {
  await ensureModels();

  const buffer = base64ToBuffer(base64Image);
  const img = await canvas.loadImage(buffer);

  const detections = await faceapi
    .detectAllFaces(img as any, new faceapi.TinyFaceDetectorOptions({
      inputSize: 320,
      scoreThreshold: 0.5,
    }))
    .withFaceLandmarks();

  const faceCount = detections.length;
  const confidence = faceCount > 0
    ? Math.round((detections.reduce((sum, d) => sum + d.detection.score, 0) / faceCount) * 100)
    : 0;

  return { faceCount, confidence };
}
