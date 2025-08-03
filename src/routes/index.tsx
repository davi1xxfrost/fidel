import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageTransition from '@/components/PageTransition';

// Lazy load all pages for better performance
const Login = React.lazy(() => import('../pages/Login'));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const BarbeariaPublica = React.lazy(() => import("../pages/BarbeariaPublica"));
const BarbeariaLogin = React.lazy(() => import("../pages/BarbeariaLogin"));
const BarbeariaCadastro = React.lazy(() => import("../pages/BarbeariaCadastro"));
const AdminLogin = React.lazy(() => import('../pages/AdminLogin'));
const AdminDashboard = React.lazy(() => import('../pages/AdminDashboard'));
const AdminGestaoClientes = React.lazy(() => import('../pages/AdminGestaoClientes'));
const AdminRelatorios = React.lazy(() => import('../pages/AdminRelatorios'));
const AdminConfiguracoes = React.lazy(() => import('../pages/AdminConfiguracoes'));
const AdminAuditoria = React.lazy(() => import('../pages/AdminAuditoria'));
const AdminResetSenha = React.lazy(() => import('../pages/AdminResetSenha'));
const BarbeariaDashboard = React.lazy(() => import('../pages/BarbeariaDashboard'));
const Index = React.lazy(() => import('../pages/Index'));
const BarbeariaListaClientes = React.lazy(() => import('../pages/BarbeariaListaClientes'));
const BarbeariaFormularioNovoCliente = React.lazy(() => import('../pages/BarbeariaFormularioNovoCliente'));
const BarbeariaScanQRCode = React.lazy(() => import('../pages/BarbeariaScanQRCode'));
const BarbeariaDetalhesCliente = React.lazy(() => import('../pages/BarbeariaDetalhesCliente'));
const CadastroCliente = React.lazy(() => import('../pages/CadastroCliente'));
const ClienteMeuCartao = React.lazy(() => import('../pages/ClienteMeuCartao'));
const ClienteRecompensas = React.lazy(() => import('../pages/ClienteRecompensas'));
const ClienteHistorico = React.lazy(() => import('../pages/ClienteHistorico'));
const ClienteFeedback = React.lazy(() => import('../pages/ClienteFeedback'));
const BarbeariaResgatarRecompensa = React.lazy(() => import('../pages/BarbeariaResgatarRecompensa'));
const BarbeariaComunicacao = React.lazy(() => import('../pages/BarbeariaComunicacao'));
const BarbeariaGerenciarNiveis = React.lazy(() => import('../pages/BarbeariaGerenciarNiveis'));

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

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground">Carregando página...</p>
    </div>
  </div>
);

const AppRoutes = () => (
  <PageTransition>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Rotas públicas */}
        {publicRoutes.map(({ path, element }) => (
          <Route 
            key={path} 
            path={path} 
            element={
              <Suspense fallback={<PageLoader />}>
                {element}
              </Suspense>
            } 
          />
        ))}

        {/* Rotas protegidas para admin */}
        {adminRoutes.map(({ path, element, role }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute role={role || 'admin'}>
                <Suspense fallback={<PageLoader />}>
                  {element}
                </Suspense>
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
                <Suspense fallback={<PageLoader />}>
                  {element}
                </Suspense>
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
                <Suspense fallback={<PageLoader />}>
                  {element}
                </Suspense>
              </ProtectedRoute>
            }
          />
        ))}

        {/* Rota para página não encontrada */}
        <Route 
          path="*" 
          element={
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          } 
        />
      </Routes>
    </Suspense>
  </PageTransition>
);

export default AppRoutes;