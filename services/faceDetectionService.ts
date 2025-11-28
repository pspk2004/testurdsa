import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

// Singleton instances
let faceDetector: FaceDetector | null = null;
let vision: FilesetResolver | null = null;
let initPromise: Promise<FaceDetector> | null = null;

export const initializeFaceDetector = async (): Promise<FaceDetector> => {
    // If already initialized, return the instance
    if (faceDetector) return faceDetector;

    // If initialization is in progress, return the existing promise
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            if (!vision) {
                vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                );
            }

            // Using createFromOptions is more robust than createFromModelPath in some contexts
            faceDetector = await FaceDetector.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
                    delegate: "CPU" // Use CPU for maximum compatibility
                },
                runningMode: "VIDEO",
                minDetectionConfidence: 0.5,
                minSuppressionThreshold: 0.5
            });

            return faceDetector;
        } catch (error) {
            console.error("FaceDetectionService: Initialization failed", error);
            initPromise = null; // Reset promise on failure so we can try again
            throw error;
        }
    })();

    return initPromise;
};

export const getFaceDetector = () => faceDetector;
