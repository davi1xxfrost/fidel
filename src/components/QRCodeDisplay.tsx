import { useEffect, useState } from 'react';
import { useQRCode } from '@/hooks/useQRCode';
import { Skeleton } from '@/components/ui/skeleton';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeDisplay = ({ value, size = 200, className = "" }: QRCodeDisplayProps) => {
  const { generateQRCode, isGenerating, error } = useQRCode();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    const generateCode = async () => {
      if (value) {
        const url = await generateQRCode(value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(url);
      }
    };

    generateCode();
  }, [value, size, generateQRCode]);

  if (isGenerating) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Skeleton 
          className="rounded-lg" 
          style={{ width: size, height: size }} 
        />
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-very-light border border-gray-light rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <p className="text-xs text-gray-medium text-center p-2">
          Erro ao gerar QR Code
        </p>
      </div>
    );
  }

  if (!qrCodeUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-very-light border border-gray-light rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <p className="text-xs text-gray-medium">
          QR Code não disponível
        </p>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src={qrCodeUrl} 
        alt="QR Code"
        className="rounded-lg border border-gray-light"
        style={{ width: size, height: size }}
      />
    </div>
  );
};