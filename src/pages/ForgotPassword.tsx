import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { requestPasswordReset } from "@/services/auth-service";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return toast.error("Digite seu e-mail.");

    setIsLoading(true);
    try {
      await requestPasswordReset(email); // Backend sends the email
      toast.success("Um link de redefinição foi enviado ao seu e-mail.");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar e-mail.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-6 text-center relative">
        {/* Small icon top-left */}
       

        {/* Banner icon centered */}
        <div className="mb-8">
          <img
            src="/V2_-_AZUL.webp"
            alt="Foco Banner"
            className="mx-auto w-40 object-contain"
          />
        </div>

        <h1 className="text-3xl font-extrabold text-blue-900 mb-1">
          Esqueceu sua senha?
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Informe seu e-mail para receber um link de redefinição de senha.
        </p>

        <div className="text-left">
          <Label htmlFor="email" className="font-semibold text-gray-700">
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemplo@foco.com"
            className="neo-inset mt-1"
            autoComplete="email"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-3 rounded-xl text-lg font-semibold shadow-md hover:shadow-lg transition"
        >
          {isLoading ? "Enviando..." : "Enviar Link"}
        </Button>

        <p className="text-xs text-gray-400 mt-6">
          Se você não receber o e-mail, verifique sua caixa de spam ou tente novamente.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
