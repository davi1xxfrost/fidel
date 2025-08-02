import { useState, useCallback, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';

export interface QRScannerResult {
  data: string;
  cornerPoints: QrScanner.Point[];
}

export interface QRScannerOptions {
  onScan?: (result: QRScannerResult) => void;
  onError?: (error: string) => void;
  highlightCodeOutline?: boolean;
  highlightScanRegion?: boolean;
  maxScansPerSecond?: number;
  returnDetailedScanResult?: boolean;
}

export interface QRScannerState {
  isScanning: boolean;
  error: string | null;
  hasCamera: boolean | null;
}

export interface QRScannerActions {
  checkCameraAvailability: () => Promise<boolean>;
  startScanning: (videoElement: HTMLVideoElement) => Promise<boolean>;
  stopScanning: () => Promise<void>;
  destroyScanner: () => Promise<void>;
  clearError: () => void;
}

// const defaultScannerOptions = {
//   highlightCodeOutline: true,
//   highlightScanRegion: false,
//   maxScansPerSecond: 5,
//   returnDetailedScanResult: true
// };

export const useQRScanner = (options: QRScannerOptions = {}): QRScannerState & QRScannerActions => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkCameraAvailability = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const hasCamera = await QrScanner.hasCamera();
      setHasCamera(hasCamera);
      return hasCamera;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao verificar câmera';
      setError(errorMessage);
      setHasCamera(false);
      options.onError?.(errorMessage);
      return false;
    }
  }, [options]);

  const startScanning = useCallback(async (videoElement: HTMLVideoElement): Promise<boolean> => {
    if (!videoElement) {
      const errorMessage = 'Elemento de vídeo é obrigatório';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return false;
    }

    try {
      setError(null);
      videoRef.current = videoElement;

      // Verificar se já existe um scanner ativo
      if (scannerRef.current) {
        await scannerRef.current.destroy();
      }

      // Verificar disponibilidade da câmera
      const cameraAvailable = await checkCameraAvailability();
      if (!cameraAvailable) {
        return false;
      }

      // Criar novo scanner
      scannerRef.current = new QrScanner(
        videoElement,
        (result: string) => {
          const scanResult: QRScannerResult = {
            data: result,
            cornerPoints: [] // qr-scanner v1.4.2 não retorna cornerPoints
          };
          options.onScan?.(scanResult);
        }
      );

      await scannerRef.current.start();
      setIsScanning(true);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao iniciar scanner';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return false;
    }
  }, [options, checkCameraAvailability]);

  const stopScanning = useCallback(async (): Promise<void> => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao parar scanner';
        setError(errorMessage);
        options.onError?.(errorMessage);
      }
    }
  }, [options]);

  const destroyScanner = useCallback(async (): Promise<void> => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.destroy();
        scannerRef.current = null;
        videoRef.current = null;
        setIsScanning(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao destruir scanner';
        setError(errorMessage);
        options.onError?.(errorMessage);
      }
    }
  }, [options]);

  // Cleanup quando o componente for desmontado
  useEffect(() => {
    return () => {
      destroyScanner();
    };
  }, [destroyScanner]);

  return {
    isScanning,
    error,
    hasCamera,
    checkCameraAvailability,
    startScanning,
    stopScanning,
    destroyScanner,
    clearError
  };
};