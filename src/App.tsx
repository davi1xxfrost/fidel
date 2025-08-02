import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { BarbeariaProvider } from "./context/BarbeariaContext";
import AppRoutes from "./routes";

// Configuração do QueryClient com opções otimizadas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BarbeariaProvider>
        <BrowserRouter 
          future={{ 
            v7_startTransition: true, 
            v7_relativeSplatPath: true 
          }}
        >
          <AppRoutes />
          <Toaster 
            position="top-right"
            richColors
            closeButton
            duration={4000}
          />
        </BrowserRouter>
      </BarbeariaProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
