CREATE TABLE recompensas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    barbearia_id UUID REFERENCES public.barbearias(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    pontos_necessarios INT NOT NULL,
    disponivel BOOLEAN DEFAULT true
);

CREATE TABLE pontos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    barbearia_id UUID REFERENCES public.barbearias(id) ON DELETE CASCADE,
    pontos INT NOT NULL,
    data_resgate TIMESTAMPTZ DEFAULT NOW()
);