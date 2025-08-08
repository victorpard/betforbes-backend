import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { register, user, isLoading } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (pwd: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/~\\-]).{8,}$/;
    return regex.test(pwd);
  };

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (!validatePassword(password)) {
      setError(
        'A senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, minúscula, número e um caractere especial (!, @, #...)'
      );
      return;
    }

    try {
      await register(name, email, password);
      setSuccessMessage(
        '✅ Cadastro efetuado com sucesso! Verifique seu e-mail para ativar a conta.'
      );
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1e1e1e]">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1e1e1e] px-4 py-8">
      <Card className="w-full max-w-sm bg-[#2a2a2a] text-white border-none shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-[#FFD700]">BETFORBES</CardTitle>
          <CardDescription className="text-gray-400 text-center">
            Crie sua conta para começar a usar a plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <div className="bg-[#e74c3c] bg-opacity-20 border border-[#e74c3c] rounded-lg p-3">
              <p className="text-[#e74c3c] text-sm">⚠️ {error}</p>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-700 bg-opacity-20 border border-green-600 rounded-lg p-3">
              <p className="text-green-400 text-sm">✅ {successMessage}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-gray-300">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-[#3a3a3a] border-gray-600 text-white placeholder-gray-400 h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#3a3a3a] border-gray-600 text-white placeholder-gray-400 h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-gray-300">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#3a3a3a] border-gray-600 text-white placeholder-gray-400 h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-[#3a3a3a] border-gray-600 text-white placeholder-gray-400 h-12"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold h-12"
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-gray-400 text-center">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-[#FFD700] hover:underline">
              Faça login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;
