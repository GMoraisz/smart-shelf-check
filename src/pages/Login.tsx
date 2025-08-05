import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scan, ArrowRight, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [step, setStep] = useState<'phone' | 'verify' | 'register'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast({
        title: "Número inválido",
        description: "Digite um número de celular válido",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    // Simular envio do código
    setTimeout(() => {
      setIsLoading(false);
      setStep('verify');
      toast({
        title: "Código enviado!",
        description: "Verifique seu celular e digite o código recebido"
      });
    }, 1500);
  };

  const handleCodeVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast({
        title: "Código inválido",
        description: "Digite o código de 6 dígitos",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    // Simular verificação - se código 123456, usuário novo, senão existente
    setTimeout(() => {
      setIsLoading(false);
      if (code === '123456') {
        setStep('register');
      } else {
        // Usuário existente, fazer login
        localStorage.setItem('user', JSON.stringify({ phone, name: 'Usuário' }));
        navigate('/');
      }
    }, 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite seu nome para continuar",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem('user', JSON.stringify({ phone, name }));
      toast({
        title: "Bem-vindo!",
        description: `Olá ${name}, sua conta foi criada com sucesso!`
      });
      navigate('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-3xl mb-4 shadow-soft">
            <Scan className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">PriceChecker</h1>
          <p className="text-muted-foreground">Consulte preços instantaneamente</p>
        </div>

        <Card className="border-0 shadow-medium">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {step === 'phone' && 'Entrar'}
              {step === 'verify' && 'Verificar código'}
              {step === 'register' && 'Quase pronto!'}
            </CardTitle>
            <CardDescription>
              {step === 'phone' && 'Digite seu número de celular para continuar'}
              {step === 'verify' && 'Digite o código enviado para seu celular'}
              {step === 'register' && 'Como você gostaria de ser chamado?'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {step === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Número do celular</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary border-0 shadow-soft hover:shadow-medium transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Continuar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {step === 'verify' && (
              <form onSubmit={handleCodeVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código de verificação</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    Código enviado para {phone}
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary border-0 shadow-soft hover:shadow-medium transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Verificar código'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setStep('phone')}
                >
                  Voltar
                </Button>
              </form>
            )}

            {step === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Seu nome</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Digite seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary border-0 shadow-soft hover:shadow-medium transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Criar conta'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {step === 'verify' && (
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground mb-2">Não recebeu o código?</p>
            <Button variant="link" className="text-primary p-0 h-auto">
              Reenviar código
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;