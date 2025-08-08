import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // TODO: Implementar lógica do backend para envio de email
      console.log('Enviando email de recuperação para:', email);
      
      // Simular delay da requisição
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
    } catch (err) {
      console.error("Erro ao enviar email de recuperação:", err);
      setError('Erro ao enviar email. Tente novamente.');
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
              Email enviado com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="bg-[#27ae60] bg-opacity-20 border border-[#27ae60] rounded-lg p-4">
              <p className="text-[#27ae60] text-sm text-center">
                ✅ Verifique seu e-mail para redefinir a senha
              </p>
              <p className="text-gray-400 text-xs text-center mt-2">
                Enviamos um link de recuperação para <strong>{email}</strong>
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link 
              to="/login" 
              className="w-full"
            >
              <Button className="w-full bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold">
                Voltar ao Login
              </Button>
            </Link>
            <div className="text-sm text-gray-400 text-center">
              Não recebeu o email?{' '}
              <button 
                onClick={() => setIsSubmitted(false)}
                className="text-[#FFD700] hover:underline"
              >
                Tentar novamente
              </button>
            </div>
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
            Recuperar senha
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="text-sm text-gray-400 text-center">
            Digite seu email para receber um link de recuperação de senha
          </div>
          
          {error && (
            <div className="bg-[#e74c3c] bg-opacity-20 border border-[#e74c3c] rounded-lg p-3">
              <p className="text-[#e74c3c] text-sm">⚠️ {error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#3a3a3a] border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
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

export default ForgotPasswordPage;

