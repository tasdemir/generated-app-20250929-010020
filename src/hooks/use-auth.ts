import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { User } from '@shared/types';
import { useNavigate } from 'react-router-dom';
export function useAuth() {
  const { user, token, isAuthenticated, setUser, logout: storeLogout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const validateToken = async () => {
      if (token && !user) {
        try {
          const userProfile = await api.get<User>('/users/profile');
          setUser(userProfile, token);
        } catch (error) {
          console.error('Token validation failed:', error);
          storeLogout();
        }
      }
      setIsLoading(false);
    };
    validateToken();
  }, [token, user, setUser, storeLogout]);
  const login = async (credentials: { email: string; password: string }) => {
    const { user, token: userId } = await api.post<{ user: User; token: string }>('/auth/login', credentials);
    setUser(user, userId);
    return user;
  };
  const register = async (data: Record<string, unknown>) => {
    const { user, token: userId } = await api.post<{ user: User; token: string }>('/auth/register', data);
    setUser(user, userId);
    return user;
  };
  const logout = () => {
    storeLogout();
    navigate('/login');
  };
  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    setUser,
  };
}