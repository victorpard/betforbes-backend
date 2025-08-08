import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  isAdminRoute?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ isAdminRoute = false }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Enquanto verifica a autenticação, mostra loader
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1e1e1e]">
        <div className="text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
          <p>Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // PROTEÇÃO CRÍTICA: Verificar se realmente está autenticado
  if (!isAuthenticated || !user) {
    console.log('PrivateRoute: Usuário não autenticado, redirecionando para /login');
    // Limpar qualquer dado inválido
    localStorage.removeItem('betforbes_auth');
    localStorage.removeItem('betforbes_token');
    sessionStorage.clear();
    
    // Redirecionar para login preservando a rota de destino
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar se é rota de admin e usuário tem permissão
  if (isAdminRoute && !user.isAdmin) {
    console.log('PrivateRoute: Usuário não é admin, redirecionando para /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Se passou por todas as verificações de segurança, renderiza a rota
  return <Outlet />;
};

export default PrivateRoute;

