import { useCallback } from "react";
import { toast as sonnerToast } from "sonner";

interface ToastOptions {
  title?: string;
  description?: string;
  status?: "success" | "error" | "info" | "warning";
  duration?: number;
}

export function useToast() {
  const toast = useCallback((options: ToastOptions) => {
    const { title, description, status = "info", duration = 4000 } = options;
    
    const message = description ? `${title}\n${description}` : title || "Mensagem";
    
    switch (status) {
      case "success":
        sonnerToast.success(message, { duration });
        break;
      case "error":
        sonnerToast.error(message, { duration });
        break;
      case "warning":
        sonnerToast.warning(message, { duration });
        break;
      case "info":
      default:
        sonnerToast.info(message, { duration });
        break;
    }
  }, []);

  return { toast };
}
