import { useRef, useEffect, useState, useCallback } from 'react';
import type { ProctoringLog } from '../types';
import { ProctoringEvent } from '../types';
import { initializeFaceDetector } from '../services/faceDetectionService';

const useProctoring = (addLog: (log: ProctoringLog) => void, enabled: boolean) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number>();
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const lastEventRef = useRef<{ event: ProctoringEvent, timestamp: number } | null>(null);
  
  // Keep callback stable to prevent restarts
  const addLogRef = useRef(addLog);
  useEffect(() => {
    addLogRef.current = addLog;
  }, [addLog]);

  const predictWebcam = useCallback(async () => {
    // Check video readiness
    if (!videoRef.current || videoRef.current.readyState < 2 || videoRef.current.videoWidth === 0) {
        requestRef.current = requestAnimationFrame(predictWebcam);
        return;
    }

    try {
        const detector = await initializeFaceDetector();
        const detections = detector.detectForVideo(videoRef.current, performance.now()).detections;
        let currentEvent: ProctoringEvent | null = null;
        
        const now = Date.now();
        // 5 second cooldown between identical events
        const isEventThrottled = lastEventRef.current && (now - lastEventRef.current.timestamp < 5000);

        if (detections.length === 0) {
            currentEvent = ProctoringEvent.NO_FACE;
        } else if (detections.length > 1) {
            currentEvent = ProctoringEvent.MULTIPLE_FACES;
        } else {
            const detection = detections[0];
            const { originX, width } = detection.boundingBox;
            const centerX = originX + width / 2;
            const videoWidth = videoRef.current.videoWidth;
            
            // Basic gaze approximation based on face position in frame
            if (centerX < videoWidth * 0.20 || centerX > videoWidth * 0.80) {
                currentEvent = ProctoringEvent.LOOKING_AWAY;
            }
        }

        if (currentEvent && (!isEventThrottled || lastEventRef.current?.event !== currentEvent)) {
            const newLog = { event: currentEvent, timestamp: now };
            addLogRef.current(newLog);
            lastEventRef.current = newLog;
        }
    } catch (err) {
        // Silent catch for frame drop errors
    }
    
    requestRef.current = requestAnimationFrame(predictWebcam);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    
    let stream: MediaStream | null = null;
    let isActive = true;

    const startStream = async () => {
      try {
        // Pre-load model
        await initializeFaceDetector();
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 360 },
                facingMode: 'user'
            },
            audio: false, 
          });
          
          if (isActive && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadeddata = () => {
                setStatus('Active');
                predictWebcam();
            }
          }
        } else {
            throw new Error("getUserMedia not supported");
        }
      } catch (err) {
        if (!isActive) return;
        console.error("Proctoring Error:", err);
        let message = "Camera error.";
        if (err instanceof Error) {
            if(err.name === 'NotAllowedError') message = "Camera permission denied.";
            else if (err.name === 'NotFoundError') message = "No camera found.";
        }
        setError(message);
        setStatus('Error');
      }
    };

    startStream();

    return () => {
      isActive = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [enabled, predictWebcam]);

  return { videoRef, status, error };
};

export default useProctoring;
