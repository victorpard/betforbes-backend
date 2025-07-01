import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  useEffect(() => {
    // Verificar se o token está presente na URL
    if (!token) {
      setError('Token de recuperação inválido ou expirado.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (!token) {
      setError('Token de recuperação inválido.');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implementar lógica do backend para redefinir senha
      console.log('Redefinindo senha com token:', token);
      console.log('Nova senha:', password);
      
      // Simular delay da requisição
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      console.error("Erro ao redefinir senha:", err);
      setError('Erro ao redefinir senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1e1e1e] px-4">
        <Card className="w-full max-w-sm bg-[#2a2a2a] text-white border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-[#FFD700]">BETFORBES</CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Senha redefinida com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="bg-[#27ae60] bg-opacity-20 border border-[#27ae60] rounded-lg p-4">
              <p className="text-[#27ae60] text-sm text-center">
                ✅ Sua senha foi redefinida com sucesso!
              </p>
              <p className="text-gray-400 text-xs text-center mt-2">
                Você será redirecionado para o login em alguns segundos...
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link 
              to="/login" 
              className="w-full"
            >
              <Button className="w-full bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold">
                Ir para Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1e1e1e] px-4">
      <Card className="w-full max-w-sm bg-[#2a2a2a] text-white border-none shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-[#FFD700]">BETFORBES</CardTitle>
          <CardDescription className="text-gray-400 text-center">
            Redefinir senha
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="text-sm text-gray-400 text-center">
            Digite sua nova senha
          </div>
          
          {error && (
            <div className="bg-[#e74c3c] bg-opacity-20 border border-[#e74c3c] rounded-lg p-3">
              <p className="text-[#e74c3c] text-sm">⚠️ {error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-gray-300">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="bg-[#3a3a3a] border-gray-600 text-white placeholder-gray-400"
              />
              <p className="text-xs text-gray-500">Mínimo de 8 caracteres</p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="bg-[#3a3a3a] border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold"
              disabled={isLoading || !token}
            >
              {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-gray-400 text-center">
            Lembrou da senha?{' '}
            <Link to="/login" className="text-[#FFD700] hover:underline">
              Voltar ao login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;

