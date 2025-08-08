import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, isLoading, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(email, password);
    } catch (err) {
      console.error('Erro no login:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Falha ao fazer login. Verifique suas credenciais.'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[#1e1e1e]">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex items-center justify-center h-screen w-full bg-[#1e1e1e] p-4">
      <Card className="w-full max-w-md bg-[#2a2a2a] text-white border-none shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-[#FFD700]">
            BETFORBES
          </CardTitle>
          <CardDescription className="text-gray-400 text-center text-lg">
            Entre na sua conta para continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {error && (
            <div className="bg-[#e74c3c] bg-opacity-20 border border-[#e74c3c] rounded-lg p-4">
              <p className="text-[#e74c3c] text-sm">⚠️ {error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-300 text-lg font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#3a3a3a] border-gray-600 text-white placeholder-gray-400 h-14 text-lg px-4"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-gray-300 text-lg font-medium">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#3a3a3a] border-gray-600 text-white placeholder-gray-400 h-14 text-lg px-4"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#FFD700] text-black hover:bg-[#e6c200] font-bold h-14 text-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <div className="text-center mt-4">
            <Link
              to="/forgot-password"
              className="text-sm md:text-base text-[#FFD700] hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <div className="text-sm md:text-base text-gray-400 text-center">
            Não tem uma conta?{' '}
            <Link to="/cadastro" className="text-[#FFD700] hover:underline font-medium">
              Cadastre-se
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
