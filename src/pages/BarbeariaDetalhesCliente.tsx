import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const BarbeariaDetalhesCliente = () => {
  const navigate = useNavigate();
  const { id, clienteId } = useParams();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <button onClick={() => navigate(`/barbearia/${id}/clientes`)} className="absolute top-4 left-4 text-white">
            <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold mb-4">Detalhes do Cliente</h1>
        <p>Barbearia ID: {id}</p>
        <p>Cliente ID: {clienteId}</p>
        {/* Lógica para buscar e exibir os detalhes do cliente aqui */}
    </div>
  );
};

export default BarbeariaDetalhesCliente;