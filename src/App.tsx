
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminMembers from "./pages/admin/Members";
import AdminGraduation from "./pages/admin/Graduation";
import AdminMural from "./pages/admin/Mural";
import AdminCalendar from "./pages/admin/AdminCalendarPage";



// Member pages
import MemberMembers from "./pages/member/Members";
import MemberMural from "./pages/member/Mural";
import ProfilePage from "./pages/member/Profile";
import MemberGraduation from "./pages/member/Graduation";
import MemberCalendar from "./pages/member/Calendar";

import Signup from "./pages/Signup";
import { AnnouncementProvider } from "./contexts/AnnouncementContext";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
               <Route path="/signup" element={<Signup />} /> 
               <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/sendemail" element={<ForgotPassword />} />
              
              {/* Admin routes */}
              <Route 
                path="/admin" 
                element={
                  <AuthenticatedLayout requiredRole="admin">
                    <AdminDashboard />
                  </AuthenticatedLayout>
                } 
              />

              <Route 
                path="/admin/members" 
                element={
                  <AuthenticatedLayout requiredRole="admin">
                    <AdminMembers />
                  </AuthenticatedLayout>
                } 
              />

              <Route 
                path="/admin/graduation" 
                element={
                  <AuthenticatedLayout requiredRole="admin">
                    <AdminGraduation />
                  </AuthenticatedLayout>
                } 
              />

              <Route 
                path="/admin/mural" 
                element={
                  <AuthenticatedLayout requiredRole="admin">
                  <AnnouncementProvider>
                    <AdminMural />
                </AnnouncementProvider>
                  </AuthenticatedLayout>
                } 
              />

              <Route 
                path="/admin/reports" 
                element={
                  <AuthenticatedLayout requiredRole="admin" >
                    <div>Página de Relatórios (Admin)</div>
                  </AuthenticatedLayout>
                } 
              />
                 <Route 
                path="/admin/calendar" 
                element={
                  <AuthenticatedLayout requiredRole="admin" >
                    <AdminCalendar />
                  </AuthenticatedLayout>
                } 
              />
              
              {/* Member routes */}

              <Route 
                path="/member/profile" 
                element={
                  <AuthenticatedLayout requiredRole="member" >
                    <ProfilePage/>
                  </AuthenticatedLayout>
                } 
              />

              <Route 
                path="/member/squad" 
                element={
                  <AuthenticatedLayout requiredRole="member">
                    <MemberMembers />
                  </AuthenticatedLayout>
                } 
              />

              <Route 
                path="/member/member/new" 
                element={
                  <AuthenticatedLayout requiredRole="member" >
                    <div>Cadastrar Novo Membro (Membro)</div>
                  </AuthenticatedLayout>
                } 
              />

              <Route 
                path="/member/mural" 
                element={
                  <AuthenticatedLayout requiredRole="member">
                    <AnnouncementProvider>
                      <MemberMural/>
                    </AnnouncementProvider>
                  </AuthenticatedLayout>
                } 
              />

              <Route 
                path="/member/grade" 
                element={
                  <AuthenticatedLayout requiredRole="member">
                
                    <MemberGraduation/>
                  </AuthenticatedLayout>
                } 
              />
               <Route 
                path="/member/calendar" 
                element={
                  <AuthenticatedLayout requiredRole="member">
                
                    <MemberCalendar/>
                  </AuthenticatedLayout>
                } 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
