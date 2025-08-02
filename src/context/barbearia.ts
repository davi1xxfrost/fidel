import { createContext } from "react";

interface Barbearia {
  id: string;
  nome_barbearia: string;
  email_contato: string;
  slug?: string;
}

interface BarbeariaContextType {
  barbeariaId: string | null;
  setBarbeariaId: (id: string | null) => void;
  slug: string | null;
  setSlug: (slug: string | null) => void;
  barbearia: Barbearia | null;
  setBarbearia: (barbearia: Barbearia | null) => void;
}

export const BarbeariaContext = createContext<BarbeariaContextType | null>(null);

export type { Barbearia, BarbeariaContextType };