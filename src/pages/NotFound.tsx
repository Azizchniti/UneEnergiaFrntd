
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const NotFound: React.FC = () => {
  const { user } = useAuth();
  
  const homeLink = !user 
    ? "/login" 
    : user.role === "admin" 
      ? "/admin" 
      : "/member";

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="max-w-md mx-auto text-center">
        <div className="py-4">
          <div className="relative w-24 h-24 mx-auto mb-6 overflow-hidden rounded-lg bg-primary/10">
            <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-primary">
              404
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Página não encontrada</h1>
          <p className="text-muted-foreground">
            A página que você está procurando não existe ou foi removida.
          </p>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
          <Link to={homeLink}>
            <Button>Voltar para Home</Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            Voltar para página anterior
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
