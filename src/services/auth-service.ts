import { profile } from '@/types';
import axios from 'axios';

//const API_URL = 'http://localhost:3000/api/auth';
const API_URL = 'https://clinicahumanbcknd.onrender.com/api/auth';

export const signUp = async (
  email: string,
  password: string,
  role: string,
  firstName: string,
  lastName: string,
  upline_id?: string,
  cpf?: string,
  phone?: string
) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, {
      email,
      password,
      role,
      firstName,
      lastName,
      upline_id,
      cpf,
      phone,
    });

    return response.data.user;
  } catch (error) {
    console.error('Signup error:', error);
    console.log("Error response data:", error.response?.data);
    return null;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/signin`, { email, password });
    const { token, user } = response.data;
    return { token, user };
  } catch (error: any) {
    console.error('Sign in error:', error);

    // ✅ Extract backend error message if available
    const message =
      error?.response?.data?.message || error?.message || "Erro ao fazer login. Tente novamente.";

    // ❗Throw with the real backend message
    throw new Error(message);
  }
};



export async function getCurrentUser(token?: string): Promise<profile | null> {
  const finalToken = token || localStorage.getItem("token");
  console.log("Using token in getCurrentUser:", finalToken);

  if (!finalToken) return null;

  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${finalToken}`,
      },
    });

    console.log("Get current user response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Get current user error:", error?.response?.data || error.message);
    return null;
  }
}
;

export const logout = async () => {
  try {
    await axios.post(`${API_URL}/logout`);
    localStorage.removeItem('access_token');
    console.log("User logged out.");
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const inviteUser = async (
  email: string,
  role: string,
  firstName: string,
  lastName: string,
  upline_id?: string,
  cpf?: string,
  phone?: string
) => {
  try {
    const response = await axios.post(`${API_URL}/invite`, {
      email,
      role,
      firstName,
      lastName,
      upline_id,
      cpf,
      phone,
    });

    return response.data;
  } catch (error) {
    console.error('Invite error:', error);
    console.log('Error response data:', error.response?.data);
    return null;
  }

  
};
export const changePassword = async (email: string) => {
  try {
    const response = await axios.post(`${API_URL}/change-password`, { email });
    return response.data; // You can customize this message based on your backend
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error.message || "Erro ao solicitar redefinição de senha.";
    throw new Error(message);
  }
};
export const requestPasswordReset = async (email: string) => {
  try {
    const response = await axios.post(`${API_URL}/request-password-reset`, { email });
    return response.data;
  } catch (error: any) {
    console.error("Request password reset error:", error);
    throw new Error(
      error?.response?.data?.error || "Erro ao enviar o link de redefinição de senha."
    );
  }
};
