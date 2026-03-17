
import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "member") {
        navigate("/member");
      }
    } else if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="mt-4 text-lg font-medium">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <Navigate to={user.role === "admin" ? "/admin" : "/member"} replace />
  );
};

export default Index;
