import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      toast.error('Token de verificação inválido.');
      navigate('/login', { replace: true });
      return;
    }

    const verifyEmail = async () => {
      try {
        const { data } = await axios.get(`/api/auth/verify-email?token=${token}`);
        if (data.success) {
          toast.success('🎉 Email verificado com sucesso!');
        } else {
          toast.error(data.message || 'Falha ao verificar email.');
        }
      } catch (err: any) {
        console.error('Erro ao verificar email:', err);
        toast.error(err.response?.data?.message || 'Erro ao verificar email.');
      } finally {
        setLoading(false);
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      {loading
        ? <p className="text-white text-lg">Verificando seu e-mail…</p>
        : <p className="text-white text-lg">Redirecionando para o login…</p>
      }
    </div>
  );
};

export default VerifyEmailPage;
