import React, { useState, useEffect, useCallback, useRef } from 'react';
import Button from '../components/Button';
import { ShieldCheckIcon, CheckCircleIcon, XCircleIcon } from '../components/icons/Icons';
import { initializeFaceDetector } from '../services/faceDetectionService';

interface SetupScreenProps {
  onSetupComplete: () => void;
}

type CalibrationStep = 'start' | 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft' | 'done';
type CheckStatus = 'pending' | 'checking' | 'passed' | 'failed';

const CheckItem: React.FC<{ label: string; status: CheckStatus; error?: string }> = ({ label, status, error }) => {
    const getStatusIcon = () => {
        switch (status) {
            case 'checking':
                return <svg className="animate-spin h-6 w-6 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
            case 'passed':
                return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
            case 'failed':
                return <XCircleIcon className="w-6 h-6 text-red-500" />;
            default:
                return <div className="w-6 h-6"></div>;
        }
    }
    return (
        <div className="flex flex-col py-2">
            <div className="flex items-center justify-between">
                <p className="text-lg">{label}</p>
                {getStatusIcon()}
            </div>
            {status === 'failed' && error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );
};

const SetupScreen: React.FC<SetupScreenProps> = ({ onSetupComplete }) => {
  const [permissions, setPermissions] = useState<{ camera: CheckStatus, mic: CheckStatus }>({ camera: 'pending', mic: 'pending' });
  const [permissionError, setPermissionError] = useState<{ camera?: string, mic?: string }>({});
  const [faceCheck, setFaceCheck] = useState<CheckStatus>('pending');
  const [faceCheckError, setFaceCheckError] = useState<string | undefined>();
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState<CalibrationStep>('start');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number>();
  const activeRef = useRef<boolean>(true); // Track if component is mounted

  const cleanupStream = useCallback(() => {
    activeRef.current = false;
    if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
  }, []);

  const predictWebcam = useCallback(async () => {
    if (!activeRef.current) return;
    
    // Ensure video is ready
    if (!videoRef.current || videoRef.current.readyState < 2 || videoRef.current.videoWidth === 0) {
      requestRef.current = requestAnimationFrame(predictWebcam);
      return;
    }

    try {
        const detector = await initializeFaceDetector();
        if (!detector) throw new Error("Detector not ready");

        const startTimeMs = performance.now();
        const detections = detector.detectForVideo(videoRef.current, startTimeMs).detections;

        if (detections.length === 1) {
            setFaceCheck('passed');
            setFaceCheckError(undefined);
        } else if (detections.length === 0) {
            setFaceCheck('failed');
            setFaceCheckError('No face detected. Please center your face.');
        } else {
            setFaceCheck('failed');
            setFaceCheckError('Multiple faces detected. Ensure you are alone.');
        }
    } catch(e) {
        console.warn("Detection error:", e);
    }
    
    if (activeRef.current) {
        requestRef.current = requestAnimationFrame(predictWebcam);
    }
  }, []);

  const startCamera = useCallback(async () => {
    activeRef.current = true;
    setPermissions(p => ({ ...p, camera: 'checking' }));
    
    // Initialize model first
    try {
        await initializeFaceDetector();
    } catch (e) {
        console.error("Model init failed", e);
        setFaceCheck('failed');
        setFaceCheckError("Could not load AI model.");
        return;
    }

    // Then camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 } // Use standard resolution
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          setPermissions(p => ({ ...p, camera: 'passed' }));
          setFaceCheck('checking');
          predictWebcam();
        };
      }
    } catch (err) {
      let camError = "Could not access camera.";
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') camError = "Permission denied. Please enable in browser settings.";
        else if (err.name === 'NotFoundError') camError = "No camera found on this device.";
      }
      setPermissionError(e => ({ ...e, camera: camError }));
      setPermissions(p => ({ ...p, camera: 'failed' }));
    }
  }, [predictWebcam]);

  const checkMic = useCallback(async () => {
    setPermissions(p => ({ ...p, mic: 'checking' }));
     try {
       const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
       audioStream.getTracks().forEach(track => track.stop());
       setPermissions(p => ({ ...p, mic: 'passed' }));
    } catch (err) {
      let micError = "Could not access microphone.";
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') micError = "Permission denied. Please enable in browser settings.";
        else if (err.name === 'NotFoundError') micError = "No microphone found on this device.";
      }
      setPermissionError(e => ({ ...e, mic: micError }));
      setPermissions(p => ({ ...p, mic: 'failed' }));
    }
  }, []);
  
  useEffect(() => {
    startCamera();
    checkMic();
    return cleanupStream;
  }, [startCamera, checkMic, cleanupStream]);

  const handleDotClick = (step: CalibrationStep) => {
    if (calibrationStep !== step) return;
    const sequence: CalibrationStep[] = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft', 'done'];
    const currentIndex = sequence.indexOf(step);
    if(currentIndex < sequence.length -1) {
        const nextStep = sequence[currentIndex + 1];
        setCalibrationStep(nextStep);
        if (nextStep === 'done') {
            setIsCalibrating(false);
        }
    }
  }
  
  const CalibrationDot: React.FC<{position: string, step: CalibrationStep, onClick: (step: CalibrationStep) => void}> = ({position, step, onClick}) => {
    const isActive = calibrationStep === step;
    return (
        <button 
            onClick={() => onClick(step)}
            aria-label={`Calibrate ${position}`}
            className={`absolute ${position} w-8 h-8 rounded-full bg-red-600 transition-all duration-300 transform disabled:opacity-30 disabled:cursor-default ${isActive ? 'scale-125 shadow-lg shadow-red-500/50 cursor-pointer' : 'opacity-50'}`}
            disabled={!isActive}
        />
    )
  };
  
  const startCalibration = () => {
      setIsCalibrating(true);
      setCalibrationStep('topLeft');
  }

  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center">
        {isCalibrating && (
             <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center text-white">
                <CalibrationDot position="top-8 left-8" step='topLeft' onClick={handleDotClick}/>
                <CalibrationDot position="top-8 right-8" step='topRight' onClick={handleDotClick} />
                <CalibrationDot position="bottom-8 right-8" step='bottomRight' onClick={handleDotClick}/>
                <CalibrationDot position="bottom-8 left-8" step='bottomLeft' onClick={handleDotClick}/>
                <h2 className="text-3xl font-bold">Calibrating Eye Tracking...</h2>
                <p className="mt-2 text-zinc-300">Please click on the highlighted red dot.</p>
             </div>
        )}
      <div className="w-full max-w-2xl bg-zinc-900/50 rounded-xl p-10 border border-zinc-700 shadow-lg">
        <ShieldCheckIcon className="w-16 h-16 mx-auto text-amber-400 mb-4" />
        <h2 className="text-4xl font-bold text-white mb-4">System & Environment Check</h2>
        <p className="text-zinc-300 mb-6 max-w-xl mx-auto">
          Before starting, we need to ensure your setup is correct for a proctored test.
        </p>

        <div className="relative w-full max-w-md mx-auto bg-black rounded-md overflow-hidden aspect-video border border-zinc-700 mb-8">
            {/* Removed object-cover to show raw video feed for better debugging and frame alignment */}
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full bg-black transform -scale-x-100" />
            {permissions.camera !== 'passed' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4">
                    <p className="text-zinc-300 text-center">{permissions.camera === 'checking' ? 'Requesting camera access...' : (permissionError.camera || 'Camera access failed.')}</p>
                </div>
            )}
            {/* Visual feedback for face check */}
            {permissions.camera === 'passed' && (
                <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/50 text-xs font-mono">
                    {faceCheck === 'passed' ? <span className="text-green-400">Face Detected</span> : <span className="text-red-400">Checking...</span>}
                </div>
            )}
        </div>

        <div className="space-y-1 text-left bg-black/50 p-6 rounded-lg border border-zinc-800 mb-8 divide-y divide-zinc-700">
            <CheckItem label="Camera Access" status={permissions.camera} error={permissionError.camera} />
            <CheckItem label="Microphone Access" status={permissions.mic} error={permissionError.mic} />
            <CheckItem label="Single Face Detected" status={faceCheck} error={faceCheckError} />
            <div className="flex items-center justify-between py-2">
                <p className={`text-lg ${faceCheck !== 'passed' ? 'text-zinc-500' : ''}`}>Eye Tracking Calibration</p>
                {calibrationStep === 'done' ? 
                    <div className="flex items-center gap-2 text-green-500">
                        <CheckCircleIcon className="w-6 h-6" />
                        <span>Completed</span>
                    </div>
                 : <button onClick={startCalibration} disabled={faceCheck !== 'passed'} className="text-amber-400 disabled:text-zinc-500 disabled:cursor-not-allowed hover:underline">Start</button> }
            </div>
        </div>
        
        <Button onClick={() => { cleanupStream(); onSetupComplete(); }} size="lg" disabled={calibrationStep !== 'done'}>
          Start Test
        </Button>
      </div>
    </div>
  );
};

export default SetupScreen;