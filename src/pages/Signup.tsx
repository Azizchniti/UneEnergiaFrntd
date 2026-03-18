import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp } from "@/services/auth-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";


const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("member");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uplineId = searchParams.get("upline_id") || undefined;
  console.log("uplineId from URL:", uplineId);


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !password || !firstName || !lastName || !role) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);

    try {
      const user = await signUp(email, password, role, firstName, lastName, uplineId);

        console.log("data:",user)
      if (user) {
        toast.success("Conta criada com sucesso. Verifique seu email para confirmar.");
        navigate("/login"); // You can change this to your login route
      } else {
        toast.error("Erro ao criar conta. Tente novamente.");
      }
    } catch (error) {
      toast.error("Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md mx-auto animate-scale-in">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="mb-4">
            <img
              src="/Logo2-bg2.png"
              alt="Foco Hub Logo"
              className="w-40 h-auto mx-auto"
            />
          </div>
        
          <p className="mt-1 text-sm text-muted-foreground">
            Plataforma de gestão de comunidades de vendas
          </p>
        </div>

        <Card className="neo border-none">
          <CardHeader>
            <CardTitle>Signup</CardTitle>
            <CardDescription>Crie sua conta e comece agora mesmo</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="neo-inset"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Seu sobrenome"
                  required
                  className="neo-inset"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="neo-inset"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="neo-inset"
                />
              </div>

                  {!uplineId && (
                    <div className="space-y-2">
                      <Label htmlFor="role">Papel</Label>
                      <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="neo-inset w-full rounded-md border p-2"
                        required
                      >
                        <option value="member">Membro</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  )}


              <Button type="submit" disabled={isLoading} className="w-full transition-all">
                {isLoading ? (
                  <>
                    <div className="mr-2 w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    Criando...
                  </>
                ) : (
                  "Criar Conta"
                )}
              </Button>
            </CardContent>
          </form>
          <CardFooter className="flex justify-center border-t text-xs text-muted-foreground p-4">
            Clinica Human &copy; {new Date().getFullYear()}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
