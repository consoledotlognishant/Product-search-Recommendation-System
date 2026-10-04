import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Link as LinkIcon, X, Sparkles, Loader2, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { SAMPLE_QUERIES, SampleQuery } from '../data/samples';
import { extractImageFeatures } from '../utils/visualSearch';
import { VisualQuery } from '../types/product';

interface VisualSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVisualSearchSuccess: (query: VisualQuery) => void;
}

export const VisualSearchModal: React.FC<VisualSearchModalProps> = ({
  isOpen,
  onClose,
  onVisualSearchSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'url' | 'samples'>('upload');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Stop camera when modal closes or tab changes
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError('Unable to access camera. Please allow camera permissions in your browser or upload an image file.');
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 480;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      stopCamera();
      processImageSource(dataUrl);
    }
  };

  const processImageSource = async (source: string | File, fileName?: string) => {
    setIsProcessing(true);
    setProcessingStatus('Loading neural network model...');

    try {
      const name = fileName || (source instanceof File ? source.name : undefined);
      setProcessingStatus('Running MobileNet neural garment classifier...');

      const visualQuery = await extractImageFeatures(source, name);

      const categoryName = visualQuery.detectedCategory || 'Garment';
      setProcessingStatus(`Detected: ${visualQuery.detectedLabel || categoryName}! Filtering strictly to ${categoryName}...`);
      await new Promise((r) => setTimeout(r, 300));

      setIsProcessing(false);
      onVisualSearchSuccess(visualQuery);
      onClose();
    } catch (error) {
      console.error('Visual search processing error:', error);
      alert('Error analyzing image. Please try a different image.');
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processImageSource(file, file.name);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processImageSource(file, file.name);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrlInput.trim()) {
      processImageSource(imageUrlInput.trim());
    }
  };

  const handleSelectSample = (sample: SampleQuery) => {
    processImageSource(sample.imageUrl);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-neutral-900/60 backdrop-blur-sm transition-opacity">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-neutral-100 text-neutral-900 rounded-lg">
                <Camera className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-semibold tracking-tight text-neutral-900">
                Visual Product Search
              </h3>
            </div>
            <p className="text-xs text-neutral-600 mt-0.5">
              Upload an image or choose a sample to find visually & stylistically similar products.
            </p>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-100 px-6 bg-neutral-50/50">
          <button
            onClick={() => {
              stopCamera();
              setActiveTab('upload');
            }}
            className={`py-3 px-4 text-xs font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'upload'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-600 hover:text-neutral-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('camera');
              startCamera();
            }}
            className={`py-3 px-4 text-xs font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'camera'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-600 hover:text-neutral-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>

          <button
            onClick={() => {
              stopCamera();
              setActiveTab('url');
            }}
            className={`py-3 px-4 text-xs font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'url'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-600 hover:text-neutral-800'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Image URL</span>
          </button>

          <button
            onClick={() => {
              stopCamera();
              setActiveTab('samples');
            }}
            className={`py-3 px-4 text-xs font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'samples'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-600 hover:text-neutral-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sample Presets</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Processing State Overlay */}
          {isProcessing ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-full border-2 border-neutral-200 border-t-neutral-900 animate-spin flex items-center justify-center"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-neutral-900 animate-pulse" />
                </div>
              </div>
              <h4 className="text-sm font-semibold text-neutral-900 mb-1">
                Analyzing Visual Features
              </h4>
              <p className="text-xs text-neutral-500 font-mono">
                {processingStatus}
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: File Upload */}
              {activeTab === 'upload' && (
                <div>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-neutral-900 bg-neutral-50 scale-[0.99]'
                        : 'border-neutral-200 hover:border-neutral-400 bg-neutral-50/40 hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white shadow-sm border border-neutral-200 flex items-center justify-center text-neutral-700">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-neutral-900">
                      Drop an image here, or <span className="underline underline-offset-2">browse file</span>
                    </p>
                    <p className="text-xs text-neutral-600 mt-1">
                      Supports JPG, PNG, WEBP up to 10MB
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: Live Camera Snap */}
              {activeTab === 'camera' && (
                <div className="text-center">
                  {cameraError ? (
                    <div className="p-6 bg-rose-50 text-rose-700 rounded-xl text-xs">
                      {cameraError}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="relative w-full max-w-sm aspect-square bg-neutral-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-xl pointer-events-none m-6"></div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCapturePhoto}
                        className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-semibold shadow-md transition"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Snap Photo & Search</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Image URL */}
              {activeTab === 'url' && (
                <form onSubmit={handleUrlSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                      Paste direct image link (HTTPS)
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="url"
                        placeholder="https://example.com/fashion-item.jpg"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-neutral-50 text-sm text-neutral-900 rounded-xl border border-neutral-200 focus:outline-none focus:border-neutral-900 transition"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!imageUrlInput.trim()}
                    className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition"
                  >
                    Analyze & Recommend Products
                  </button>
                </form>
              )}

              {/* TAB 4 / PRESETS: One-Click Quick Test Queries */}
              <div className="mt-6 pt-5 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                    Quick-Try Sample Images
                  </span>
                  <span className="text-[11px] text-neutral-600">
                    1-click instant test
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {SAMPLE_QUERIES.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className="group flex flex-col text-left p-2 rounded-xl border border-neutral-200 hover:border-neutral-900 bg-white hover:bg-neutral-50 transition"
                    >
                      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-100 mb-2">
                        <img
                          src={sample.imageUrl}
                          alt={sample.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-xs font-medium text-neutral-900 truncate">
                        {sample.title}
                      </span>
                      <span className="text-[10px] text-neutral-600">
                        {sample.category} • {sample.expectedColor}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
