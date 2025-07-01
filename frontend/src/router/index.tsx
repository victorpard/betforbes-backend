import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

// Layout
import MainLayout from '@/components/layout/MainLayout';

// Pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import PremiumDashboardPage from '../pages/PremiumDashboardPage';
import AdminPage from '../pages/AdminPage';
import HistoriaPage from '../pages/HistoriaPage';
import BetPage from '../pages/BetPage';
import AfiliadosPage from '../pages/AfiliadosPage';
import TransacoesPage from '../pages/TransacoesPage';
import ConfiguracoesPage from '../pages/ConfiguracoesPage';
import OrdersPage from '../pages/OrdersPage';
import VerifyEmailPage from '../pages/VerifyEmailPage'; // ✅ Importação adicionada

// Importar PrivateRoute
import PrivateRoute from './PrivateRoute';

// Define the application routes com proteção robusta
const router = createBrowserRouter(
  [
    // Rotas públicas (sem autenticação)
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/cadastro',
      element: <RegisterPage />,
    },
    {
      path: '/forgot-password',
      element: <ForgotPasswordPage />,
    },
    {
      path: '/reset-password',
      element: <ResetPasswordPage />,
    },
    {
      path: '/verify-email', // ✅ Rota pública para verificação de e-mail
      element: <VerifyEmailPage />,
    },

    // TODAS as outras rotas são protegidas
    {
      path: '/',
      element: <PrivateRoute />,
      children: [
        {
          path: '/',
          element: <MainLayout />,
          children: [
            {
              index: true,
              element: <PremiumDashboardPage />,
            },
            {
              path: 'dashboard',
              element: <PremiumDashboardPage />,
            },
            {
              path: 'bet',
              element: <BetPage />,
            },
            {
              path: 'historia',
              element: <HistoriaPage />,
            },
            {
              path: 'afiliados',
              element: <AfiliadosPage />,
            },
            {
              path: 'transacoes',
              element: <TransacoesPage />,
            },
            {
              path: 'configuracoes',
              element: <ConfiguracoesPage />,
            },
            {
              path: 'ordens',
              element: <OrdersPage />,
            },
          ],
        },
      ],
    },

    // Rota de admin com proteção adicional
    {
      path: '/admin',
      element: <PrivateRoute isAdminRoute={true} />,
      children: [
        {
          index: true,
          element: <AdminPage />,
        },
      ],
    },

    // Catch-all: rota fallback
    {
      path: '*',
      element: <PrivateRoute />,
      children: [
        {
          path: '*',
          element: <PremiumDashboardPage />,
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);

export default router;
