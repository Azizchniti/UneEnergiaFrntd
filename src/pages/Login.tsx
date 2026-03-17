import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function redirectUserByRole(role: string) {
    switch (role) {
      case "admin":
        return "/admin";
      case "member":
        return "/member";
      default:
        return "/";
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !password) return;

    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        if (user?.role) {
          navigate(redirectUserByRole(user.role));
        } else {
          throw new Error("User role not found");
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex bg-[#0b0f14] overflow-hidden">

      {/* ENERGY BACKGROUND */}
      <div className="absolute inset-0">
        <div className="absolute w-[700px] h-[700px] bg-green-500/20 rounded-full blur-[160px] top-[-200px] left-[-200px]" />
        <div className="absolute w-[600px] h-[600px] bg-yellow-400/20 rounded-full blur-[160px] bottom-[-200px] right-[-200px]" />
        <div className="absolute w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[140px] top-[40%] left-[40%]" />
      </div>

      {/* GRID TEXTURE */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(#fff_1px,transparent_1px),linear-gradient(to_right,#fff_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* LEFT SIDE BRAND SECTION */}
      <div className="relative hidden lg:flex flex-col justify-center w-1/2 px-20 text-white z-10">
      
        <img
          src="/Logo2-bg2.png"
          alt="Une Energia"
          className="w-72 drop-shadow-[0_0_40px_rgba(34,197,94,0.6)] mb-16"
        />

        <h1 className="text-4xl font-bold leading-tight mb-6">
          Energia renovável para
          <span className="text-green-400"> transformar vendas</span>
        </h1>

        <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
          Plataforma de gestão de comunidades de energia que conecta
          parceiros, clientes e resultados em um único ambiente inteligente.
        </p>

        <div className="mt-12 flex gap-6 text-sm text-zinc-500">
          <span>⚡ Gestão de vendas</span>
          <span>🌱 Energia renovável</span>
          <span>📊 Dados inteligentes</span>
        </div>

      </div>

      {/* RIGHT SIDE LOGIN */}
      <div className="flex items-center justify-center w-full lg:w-1/2 relative z-10 p-8">

        <Card className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-2xl">

          <CardContent className="p-10">

            <div className="lg:hidden flex justify-center mb-8">dd
              <img
                src="/Logo2-bg.png"
                alt="Une Energia"
                className="w-52"
              />
            </div>

            <h2 className="text-2xl font-semibold text-white mb-2">
              Acessar plataforma
            </h2>

            <p className="text-sm text-zinc-400 mb-8">
              Entre com suas credenciais
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">
                  Email
                </Label>

                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-green-500 focus:ring-green-500 transition"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">
                  Senha
                </Label>

                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-green-500 focus:ring-green-500 transition"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-yellow-400 text-black font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Entrar"
                )}
              </Button>

              <div className="flex justify-end text-sm">
                <button
                  type="button"
                  onClick={() => navigate("/sendemail")}
                  className="text-green-400 hover:text-green-300 transition"
                >
                  Esqueceu sua senha?
                </button>
              </div>

            </form>

          </CardContent>

          <CardFooter className="justify-center text-xs text-zinc-500 border-t border-white/10 py-4">
            Une Energia © {new Date().getFullYear()}
          </CardFooter>

        </Card>

      </div>

    </div>
  );
};

export default Login;

