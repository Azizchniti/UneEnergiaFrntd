import supabase from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Live validation for password match
  useEffect(() => {
    if (confirmPassword && newPassword !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
    } else {
      setErrorMessage("");
    }
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    const access_token = searchParams.get("access_token");
    const type = searchParams.get("type");

    if (access_token && type === "recovery") {
      supabase.auth
        .setSession({ access_token, refresh_token: "" })
        .then(({ error }) => {
          if (error) {
            console.error("Erro ao configurar sessão:", error.message);
            setErrorMessage("Link inválido ou expirado.");
          }
        });
    }
  }, [searchParams]);

  const handleChangePassword = async () => {
    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      setErrorMessage("Erro ao redefinir senha. Tente novamente.");
    } else {
      navigate("/login");
    }
  };

  // Button disabled only if loading or any password input is empty
  const isDisabled = loading || !newPassword || !confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Redefinir Senha</h2>

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Nova senha
        </label>
        <input
          type="password"
          placeholder="Digite sua nova senha"
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Confirmar nova senha
        </label>
        <input
          type="password"
          placeholder="Confirme sua nova senha"
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {errorMessage && (
          <div className="flex items-center gap-2 bg-red-100 border border-red-400 text-red-700 text-sm px-4 py-2 rounded-md mb-4 animate-fade-in">
            <svg
              className="w-4 h-4 fill-current text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M10 15a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-.707-9.707a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L10 7.414 4.707 12.707a1 1 0 01-1.414-1.414l6-6z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          onClick={handleChangePassword}
          disabled={isDisabled}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Redefinindo..." : "Redefinir Senha"}
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
