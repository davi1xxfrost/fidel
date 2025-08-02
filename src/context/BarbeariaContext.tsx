import { useState, ReactNode } from "react";
import { BarbeariaContext, type Barbearia } from "./barbearia";

export const BarbeariaProvider = ({ children }: { children: ReactNode }) => {
  const [barbeariaId, setBarbeariaId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [barbearia, setBarbearia] = useState<Barbearia | null>(null);

  return (
    <BarbeariaContext.Provider 
      value={{ 
        barbeariaId, 
        setBarbeariaId, 
        slug, 
        setSlug, 
        barbearia, 
        setBarbearia 
      }}
    >
      {children}
    </BarbeariaContext.Provider>
  );
};