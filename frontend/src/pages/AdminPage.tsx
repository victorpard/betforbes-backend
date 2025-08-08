import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Enquanto carrega os dados do usuário
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Verificando acesso...</p>
      </div>
    );
  }

  // Verifica se o usuário está logado E se é admin
  // A rota /admin já deve ser protegida por PrivateRoute, mas adicionamos uma verificação extra aqui
  // O PrivateRoute pode verificar apenas se está logado, e aqui verificamos o 'isAdmin'
  // Ou o PrivateRoute pode receber um parâmetro para verificar 'isAdmin' diretamente.
  // Assumindo que o PrivateRoute já garante que 'user' não é null, mas verificamos 'isAdmin'.
  if (!user || !user.isAdmin) {
    // Se não for admin, redireciona para o painel normal ou login
    // Idealmente, o PrivateRoute já faria isso, mas é uma segurança.
    console.warn('Acesso não autorizado à página de admin.');
    return <Navigate to="/painel" replace />;
    // Ou poderia mostrar uma mensagem de acesso negado:
    // return (
    //   <div className="container mx-auto p-4">
    //     <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
    //     <p>Você não tem permissão para acessar esta página.</p>
    //   </div>
    // );
  }

  // Se chegou aqui, é admin
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Painel Administrativo</h1>
      <p>Bem-vindo(a), Administrador(a) <span className="font-semibold">{user.name}</span>!</p>
      <p>Esta área é restrita e contém funcionalidades administrativas.</p>
      {/* TODO: Adicionar componentes e funcionalidades específicas do admin */}

      <div className="mt-8 border p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Gerenciamento de Usuários (Mock)</h2>
        <p>Aqui você poderá gerenciar os usuários da plataforma.</p>
        <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Ver Usuários (Mock)
        </button>
      </div>
    </div>
  );
};

export default AdminPage;

