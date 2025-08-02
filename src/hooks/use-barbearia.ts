import { useContext } from "react";
import { BarbeariaContext, type BarbeariaContextType } from "@/context/barbearia";

export const useBarbearia = (): BarbeariaContextType => {
  const context = useContext(BarbeariaContext);
  
  if (!context) {
    throw new Error('useBarbearia must be used within a BarbeariaProvider');
  }
  
  return context;
};