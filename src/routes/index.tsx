import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import NotFound from "@/pages/NotFound";
import BarbeariaPublica from "../pages/BarbeariaPublica";
import BarbeariaLogin from "../pages/BarbeariaLogin";
import BarbeariaCadastro from "../pages/BarbeariaCadastro";
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/AdminDashboard';
import AdminGestaoClientes from '../pages/AdminGestaoClientes';
import AdminRelatorios from '../pages/AdminRelatorios';
import AdminConfiguracoes from '../pages/AdminConfiguracoes';
import AdminAuditoria from '../pages/AdminAuditoria';
import AdminResetSenha from '../pages/AdminResetSenha';
import BarbeariaDashboard from '../pages/BarbeariaDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import _BarbeariaRouter from '../pages/BarbeariaRouter';
import Index from '../pages/Index';
import BarbeariaListaClientes from '../pages/BarbeariaListaClientes';
import BarbeariaFormularioNovoCliente from '../pages/BarbeariaFormularioNovoCliente';
import BarbeariaScanQRCode from '../pages/BarbeariaScanQRCode';
import BarbeariaDetalhesCliente from '../pages/BarbeariaDetalhesCliente';
import CadastroCliente from '../pages/CadastroCliente';
import ClienteMeuCartao from '../pages/ClienteMeuCartao';
import ClienteRecompensas from '../pages/ClienteRecompensas';
import ClienteHistorico from '../pages/ClienteHistorico';
import ClienteFeedback from '../pages/ClienteFeedback';
import BarbeariaResgatarRecompensa from '../pages/BarbeariaResgatarRecompensa';
import BarbeariaComunicacao from '../pages/BarbeariaComunicacao';
import BarbeariaGerenciarNiveis from '../pages/BarbeariaGerenciarNiveis';

type Role = 'admin' | 'barbearia' | 'cliente';

interface RouteConfig {
  path: string;
  element: JSX.Element;
  role?: Role;
}

// Rotas públicas
const publicRoutes: RouteConfig[] = [
  { path: "/", element: <Index /> },
  { path: "/login", element: <Login /> },
  { path: "/cadastro-cliente", element: <CadastroCliente /> },
  { path: "/admin", element: <AdminLogin /> },
  { path: "/:slug", element: <BarbeariaPublica /> },
  { path: "/:slug/login", element: <BarbeariaLogin /> },
  { path: "/:slug/cadastro", element: <BarbeariaCadastro /> },
];

// Rotas protegidas para admin
const adminRoutes: RouteConfig[] = [
  {
    path: "/admin-dashboard",
    element: <AdminDashboard />,
    role: "admin"
  },
  {
    path: "/admin-gestao-clientes",
    element: <AdminGestaoClientes />,
    role: "admin"
  },
  {
    path: "/admin-relatorios",
    element: <AdminRelatorios />,
    role: "admin"
  },
  {
    path: "/admin-configuracoes",
    element: <AdminConfiguracoes />,
    role: "admin"
  },
  {
    path: "/admin-auditoria",
    element: <AdminAuditoria />,
    role: "admin"
  },
  {
    path: "/admin-reset-senha",
    element: <AdminResetSenha />,
    role: "admin"
  },
];

// Rotas protegidas para barbearia (usando slug)
const barbeariaRoutes: RouteConfig[] = [
  {
    path: "/:slug/dashboard",
    element: <BarbeariaDashboard />,
    role: "barbearia"
  },
  {
    path: "/:slug/clientes",
    element: <BarbeariaListaClientes />,
    role: "barbearia"
  },
  {
    path: "/:slug/clientes/novo",
    element: <BarbeariaFormularioNovoCliente />,
    role: "barbearia"
  },
  {
    path: "/:slug/scan-qrcode",
    element: <BarbeariaScanQRCode />,
    role: "barbearia"
  },
  {
    path: "/:slug/detalhes-cliente/:clienteId",
    element: <BarbeariaDetalhesCliente />,
    role: "barbearia"
  },
  {
    path: "/:slug/resgatar-recompensa",
    element: <BarbeariaResgatarRecompensa />,
    role: "barbearia"
  },
  {
    path: "/:slug/comunicacao",
    element: <BarbeariaComunicacao />,
    role: "barbearia"
  },
  {
    path: "/:slug/gerenciar-niveis",
    element: <BarbeariaGerenciarNiveis />,
    role: "barbearia"
  },
];

// Rotas do cliente
const clienteRoutes: RouteConfig[] = [
  {
    path: "/cliente-meu-cartao",
    element: <ClienteMeuCartao />,
    role: "cliente"
  },
  {
    path: "/cliente-recompensas",
    element: <ClienteRecompensas />,
    role: "cliente"
  },
  {
    path: "/cliente-historico",
    element: <ClienteHistorico />,
    role: "cliente"
  },
  {
    path: "/cliente-feedback",
    element: <ClienteFeedback />,
    role: "cliente"
  },
];

const AppRoutes = () => (
  <Routes>
    {/* Rotas públicas */}
    {publicRoutes.map(({ path, element }) => (
      <Route key={path} path={path} element={element} />
    ))}

    {/* Rotas protegidas para admin */}
    {adminRoutes.map(({ path, element, role }) => (
      <Route
        key={path}
        path={path}
        element={
          <ProtectedRoute role={role || 'admin'}>
            {element}
          </ProtectedRoute>
        }
      />
    ))}

    {/* Rotas protegidas para barbearia */}
    {barbeariaRoutes.map(({ path, element, role }) => (
      <Route
        key={path}
        path={path}
        element={
          <ProtectedRoute role={role || 'barbearia'}>
            {element}
          </ProtectedRoute>
        }
      />
    ))}

    {/* Rotas do cliente */}
    {clienteRoutes.map(({ path, element, role }) => (
      <Route
        key={path}
        path={path}
        element={
          <ProtectedRoute role={role || 'cliente'}>
            {element}
          </ProtectedRoute>
        }
      />
    ))}

    {/* Rota para página não encontrada */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;