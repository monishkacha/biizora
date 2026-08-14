import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Barcode,
  Search,
  Plus,
  Volume2,
  Lock,
  Smartphone
} from 'lucide-react';

export default function CameraBarcodeScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  products = [],
  title = 'Barcode Camera Scanner',
  subtitle = 'Position the product barcode within the camera viewfinder'
}) {
  const [status, setStatus] = useState('initializing'); // 'initializing' | 'scanning' | 'permission_denied' | 'no_camera' | 'camera_in_use' | 'scanned' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [facingMode, setFacingMode] = useState('user'); // 'user' (front camera) preferred on laptop/PC
  const [scannedCode, setScannedCode] = useState('');
  const [matchedProduct, setMatchedProduct] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [availableCameras, setAvailableCameras] = useState([]);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  // Stop camera tracks cleanly
  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Play audio beep feedback on scan
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // AudioContext not allowed or unsupported
    }
  };

  // Initialize camera & start video stream
  const startCamera = async (preferFacing = facingMode) => {
    stopCamera();
    setStatus('initializing');
    setErrorMessage('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('no_camera');
      setErrorMessage('Browser API mediaDevices.getUserMedia is not supported on this browser or secure context (HTTPS required).');
      return;
    }

    // List available video input devices
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = devices.filter((d) => d.kind === 'videoinput');
      setAvailableCameras(videoDevs);
    } catch {
      // ignore
    }

    let stream = null;
    try {
      // Primary attempt: try requested facingMode with fallback
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: preferFacing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch (err1) {
      console.warn('First getUserMedia attempt failed, trying fallback constraints:', err1);
      try {
        // Fallback attempt: any video stream
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      } catch (err2) {
        console.error('All getUserMedia attempts failed:', err2);
        if (err2.name === 'NotAllowedError' || err2.name === 'PermissionDeniedError') {
          setStatus('permission_denied');
          setErrorMessage('Camera access permission was denied. Please allow camera permissions in your browser address bar.');
        } else if (err2.name === 'NotFoundError' || err2.name === 'DevicesNotFoundError') {
          setStatus('no_camera');
          setErrorMessage('No camera device found on your system. Please attach a web camera or type the barcode manually.');
        } else if (err2.name === 'NotReadableError' || err2.name === 'TrackStartError') {
          setStatus('camera_in_use');
          setErrorMessage('Camera is currently in use by another application or browser tab.');
        } else {
          setStatus('error');
          setErrorMessage(err2.message || 'Unable to access camera.');
        }
        return;
      }
    }

    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(() => {});
        setStatus('scanning');
        startBarcodeDetectionLoop();
      };
    }
  };

  // Barcode Detection Loop using window.BarcodeDetector API
  const startBarcodeDetectionLoop = () => {
    let detector = null;

    if ('BarcodeDetector' in window) {
      try {
        detector = new window.BarcodeDetector({
          formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'qr_code', 'upc_a', 'upc_e', 'itf', 'data_matrix'],
        });
      } catch {
        detector = null;
      }
    }

    const scanFrame = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      if (detector) {
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const rawVal = barcodes[0].rawValue;
            if (rawVal) {
              handleBarcodeDetected(rawVal);
              return; // Stop detection loop for this code
            }
          }
        } catch {
          // ignore frame detection errors
        }
      }

      animFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animFrameRef.current = requestAnimationFrame(scanFrame);
  };

  // Handle successful detection (from camera loop or manual input)
  const handleBarcodeDetected = (code) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    playBeep();
    setScannedCode(trimmed);
    setStatus('scanned');

    // Search product if catalog is provided
    let found = null;
    if (products && products.length > 0) {
      found = products.find(
        (p) =>
          (p.barcode && p.barcode.toLowerCase() === trimmed.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase() === trimmed.toLowerCase()) ||
          (p.code && p.code.toLowerCase() === trimmed.toLowerCase()) ||
          String(p.id).toLowerCase() === trimmed.toLowerCase()
      );
    }
    setMatchedProduct(found || null);
  };

  const toggleCameraFacing = () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleBarcodeDetected(manualInput.trim());
  };

  const handleConfirmScan = () => {
    if (scannedCode) {
      onScanSuccess(scannedCode, matchedProduct);
      stopCamera();
      onClose();
    }
  };

  const handleScanAnother = () => {
    setScannedCode('');
    setMatchedProduct(null);
    setManualInput('');
    startCamera(facingMode);
  };

  useEffect(() => {
    if (isOpen) {
      setScannedCode('');
      setMatchedProduct(null);
      setManualInput('');
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-md">
      <div className="w-full max-w-lg bg-white rounded-[24px] shadow-2xl border border-stone overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone flex items-center justify-between bg-cream/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-bottle/10 border border-green-bottle/20 flex items-center justify-center text-green-bottle">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-charcoal">{title}</h3>
              <p className="text-xs text-warm-gray">{subtitle}</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-xl text-warm-gray hover:text-charcoal hover:bg-stone/20 transition-all"
            title="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Status: Camera Active or Scanned Result */}
          {status === 'scanned' ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Barcode Scanned Successfully!</span>
                </div>
                <p className="text-xs font-mono bg-white/70 px-3 py-1.5 rounded-xl border border-emerald-300 w-fit text-charcoal font-semibold">
                  {scannedCode}
                </p>
              </div>

              {matchedProduct ? (
                <div className="p-4 rounded-2xl border border-stone bg-cream/40 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-bottle bg-green-bottle/10 px-2 py-0.5 rounded-md">
                    Matched Product Found
                  </span>
                  <h4 className="text-sm font-bold text-charcoal">{matchedProduct.name || matchedProduct.title}</h4>
                  <div className="flex justify-between items-center text-xs text-warm-gray font-semibold pt-1">
                    <span>
                      Price: <strong className="text-charcoal">₹{matchedProduct.price || matchedProduct.sellingPrice || 0}</strong>
                    </span>
                    <span>
                      Stock: <strong className="text-charcoal">{matchedProduct.stock ?? matchedProduct.quantity ?? 'Available'} units</strong>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60 text-amber-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Product Not Found in Inventory Catalog</span>
                  </div>
                  <p className="text-xs text-amber-800">
                    Barcode standard value <strong className="font-mono">{scannedCode}</strong> was detected, but no matching product was found in active inventory.
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleScanAnother}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-stone bg-cream text-charcoal font-semibold text-xs hover:bg-stone/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" /> Scan Another
                </button>
                <button
                  type="button"
                  onClick={handleConfirmScan}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-green-bottle text-white font-semibold text-xs hover:bg-green-forest shadow-subtle transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> {matchedProduct ? 'Add Item to Bill' : 'Use Barcode'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Video Camera Viewport Container */}
              <div className="relative w-full aspect-[4/3] bg-charcoal rounded-2xl overflow-hidden border border-stone shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />

                {/* Live Scanning Viewfinder Overlay */}
                {status === 'scanning' && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-64 h-40 border-2 border-green-bottle rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                      {/* Laser scanner animated line */}
                      <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 shadow-[0_0_8px_#34d399] animate-[pulse_1.5s_infinite]" />
                      <div className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-charcoal/80 px-2 py-0.5 rounded">
                        Scanning Live
                      </div>
                    </div>
                  </div>
                )}

                {/* State Overlays */}
                {status === 'initializing' && (
                  <div className="absolute inset-0 bg-charcoal/90 text-white flex flex-col items-center justify-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-green-bottle animate-spin" />
                    <p className="text-xs font-semibold text-stone-200">Accessing device camera...</p>
                  </div>
                )}

                {status === 'permission_denied' && (
                  <div className="absolute inset-0 bg-charcoal/95 p-6 text-white flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Camera Permission Required</h4>
                    <p className="text-xs text-stone-300 max-w-xs">{errorMessage}</p>
                    <button
                      type="button"
                      onClick={() => startCamera(facingMode)}
                      className="px-4 py-2 rounded-xl bg-green-bottle text-white text-xs font-semibold hover:bg-green-forest"
                    >
                      Retry Permission Request
                    </button>
                  </div>
                )}

                {(status === 'no_camera' || status === 'camera_in_use' || status === 'error') && (
                  <div className="absolute inset-0 bg-charcoal/95 p-6 text-white flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Camera Unavailable</h4>
                    <p className="text-xs text-stone-300 max-w-xs">{errorMessage}</p>
                    <button
                      type="button"
                      onClick={() => startCamera(facingMode)}
                      className="px-4 py-2 rounded-xl bg-cream text-charcoal text-xs font-semibold hover:bg-white"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {/* Camera Control Toolbar Overlay */}
                {status === 'scanning' && availableCameras.length > 1 && (
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-charcoal/80 hover:bg-charcoal text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 backdrop-blur-sm"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Switch Camera</span>
                  </button>
                )}
              </div>

              {/* Manual Barcode Input Fallback */}
              <div className="pt-2 border-t border-stone space-y-2">
                <p className="text-xs font-semibold text-charcoal flex items-center justify-between">
                  <span>Or enter barcode / SKU manually:</span>
                  <span className="text-[10px] text-warm-gray font-normal">Press Enter or Scan</span>
                </p>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Barcode className="w-4 h-4 text-warm-gray absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. 8901002345 or SKU-101"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-cream/40 border border-stone rounded-xl focus:outline-none focus:border-green-bottle text-charcoal"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-bottle text-white text-xs font-semibold rounded-xl hover:bg-green-forest"
                  >
                    Search
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-cream/30 border-t border-stone flex justify-between items-center text-xs text-warm-gray">
          <span>Supported: EAN-13, EAN-8, Code 128, QR, UPC</span>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="font-semibold text-charcoal hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
