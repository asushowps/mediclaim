import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';

interface WebcamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string, filename: string) => void;
}

export const WebcamModal: React.FC<WebcamModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setCameraError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // prefer rear camera for documents
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please allow camera permissions in your browser or upload an image.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (!capturedImage) return;
    onCapture(capturedImage, `Camera_Receipt_${Date.now()}.jpg`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Scan Receipt with Camera</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera / Preview Area */}
        <div className="relative bg-slate-950 aspect-4/3 flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center text-rose-300 max-w-sm">
              <p className="text-sm font-medium">{cameraError}</p>
              <button
                onClick={startCamera}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Try Again
              </button>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured receipt" className="w-full h-full object-contain" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* Guide Overlay for alignment */}
          {!capturedImage && !cameraError && (
            <div className="absolute inset-8 border-2 border-dashed border-teal-400/60 rounded-xl pointer-events-none flex flex-col justify-between p-3">
              <span className="text-[11px] font-semibold text-teal-300 bg-slate-900/60 px-2 py-0.5 rounded w-max">
                Align clinic receipt inside frame
              </span>
              <span className="text-[10px] text-slate-300 bg-slate-900/60 px-2 py-0.5 rounded text-center">
                Ensure text, totals and clinic name are well-lit and in focus
              </span>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-2">
            {capturedImage ? (
              <>
                <button
                  onClick={handleRetake}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
                <button
                  onClick={handleConfirm}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Use Photo</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleSnap}
                disabled={Boolean(cameraError)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 shadow-sm disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                <span>Snap Photo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
