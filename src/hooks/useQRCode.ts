import { useState, useCallback } from 'react';
import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  type?: 'image/png' | 'image/jpeg' | 'image/webp';
}

export interface QRCodeState {
  isGenerating: boolean;
  error: string | null;
}

export interface QRCodeActions {
  generateQRCode: (text: string, options?: QRCodeOptions) => Promise<string | null>;
  generateQRCodeCanvas: (canvas: HTMLCanvasElement, text: string, options?: QRCodeOptions) => Promise<boolean>;
  clearError: () => void;
}

const defaultOptions: Required<QRCodeOptions> = {
  width: 256,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  errorCorrectionLevel: 'M',
  type: 'image/png'
};

export const useQRCode = (): QRCodeState & QRCodeActions => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const generateQRCode = useCallback(async (
    text: string, 
    options: QRCodeOptions = {}
  ): Promise<string | null> => {
    if (!text.trim()) {
      setError('Texto é obrigatório para gerar QR Code');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const finalOptions = {
        ...defaultOptions,
        ...options,
        color: {
          ...defaultOptions.color,
          ...options.color
        }
      };

      const qrCodeDataURL = await QRCode.toDataURL(text, finalOptions);
      return qrCodeDataURL;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar QR Code';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateQRCodeCanvas = useCallback(async (
    canvas: HTMLCanvasElement,
    text: string,
    options: QRCodeOptions = {}
  ): Promise<boolean> => {
    if (!text.trim()) {
      setError('Texto é obrigatório para gerar QR Code');
      return false;
    }

    if (!canvas) {
      setError('Canvas é obrigatório para gerar QR Code');
      return false;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const finalOptions = {
        ...defaultOptions,
        ...options,
        color: {
          ...defaultOptions.color,
          ...options.color
        }
      };

      await QRCode.toCanvas(canvas, text, finalOptions);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar QR Code';
      setError(errorMessage);
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateQRCode,
    generateQRCodeCanvas,
    clearError,
    isGenerating,
    error
  };
};