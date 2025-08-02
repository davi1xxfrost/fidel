import { useEffect, useRef, useState } from 'react';
import { useQRScanner, QRScannerResult } from '@/hooks/useQRScanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, CameraOff, Keyboard } from 'lucide-react';

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const QRCodeScanner = ({ onScan, onError, className = "" }: QRCodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [manualInput, setManualInput] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);

  const {
    isScanning,
    error,
    hasCamera,
    checkCameraAvailability,
    startScanning,
    stopScanning,
    destroyScanner
  } = useQRScanner({
    onScan: (result: QRScannerResult) => {
      onScan(result.data);
      handleStopScanning();
    },
    onError: (error: string) => {
      onError?.(error);
    }
  });

  useEffect(() => {
    checkCameraAvailability();
    
    return () => {
      destroyScanner();
    };
  }, [checkCameraAvailability, destroyScanner]);

  const handleStartScanning = async () => {
    if (videoRef.current && hasCamera) {
      const success = await startScanning(videoRef.current);
      if (success) {
        setScannerActive(true);
        setShowManualInput(false);
      }
    }
  };

  const handleStopScanning = async () => {
    await stopScanning();
    setScannerActive(false);
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput("");
      setShowManualInput(false);
    }
  };

  const toggleManualInput = () => {
    if (scannerActive) {
      handleStopScanning();
    }
    setShowManualInput(!showManualInput);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Scanner Video */}
      <div className="relative">
        <div className="w-full h-80 bg-gray-very-light border-2 border-dashed border-gray-light rounded-lg overflow-hidden flex items-center justify-center">
          {hasCamera === false ? (
            <div className="text-center space-y-2">
              <CameraOff className="w-12 h-12 text-gray-medium mx-auto" />
              <p className="text-sm text-gray-medium">Câmera não disponível</p>
            </div>
          ) : scannerActive ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
          ) : (
            <div className="text-center space-y-2">
              <Camera className="w-12 h-12 text-gray-medium mx-auto" />
              <p className="text-sm text-gray-medium">
                Toque para ativar a câmera
              </p>
            </div>
          )}
        </div>

        {/* Scanner Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {hasCamera && !showManualInput && (
            <Button
              onClick={scannerActive ? handleStopScanning : handleStartScanning}
              variant={scannerActive ? "destructive" : "default"}
              className="font-inter"
            >
              {scannerActive ? (
                <>
                  <CameraOff className="w-4 h-4 mr-2" />
                  Parar
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Escanear
                </>
              )}
            </Button>
          )}
          
          <Button
            onClick={toggleManualInput}
            variant="outline"
            className="font-inter"
          >
            <Keyboard className="w-4 h-4 mr-2" />
            Manual
          </Button>
        </div>
      </div>

      {/* Manual Input */}
      {showManualInput && (
        <div className="space-y-3 p-4 bg-gray-very-light rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground font-inter">
              Digite o código do QR Code:
            </label>
            <Input
              type="text"
              placeholder="Ex: ABC12345"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value.toUpperCase())}
              className="h-12 text-lg font-mono"
              maxLength={8}
            />
          </div>
                      <Button
              onClick={handleManualSubmit}
              disabled={!manualInput.trim()}
              className="w-full font-inter"
            >
              Confirmar Código
            </Button>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-inter">{error}</p>
        </div>
      )}

      {isScanning && (
        <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-600 font-inter">
            Aponte a câmera para o QR Code...
          </p>
        </div>
      )}
    </div>
  );
};