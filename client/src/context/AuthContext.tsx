import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  createdAt?: string;
  token?: string; 
  phone: string;
  country: string;
  profileImage?: string;
  city: string;
  timezone: string;

}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResult {
  success: boolean;
  message?: string;
  error?: string;
  user?: User;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async ({ email, password }: LoginCredentials): Promise<LoginResult> => {
  try {
    const response = await axios.post("http://localhost:5000/api/users/login", {
      email: email.trim().toLowerCase(),
      password,
    });

    if (response.data && response.data.success === true) {
      const userData = response.data.user;
      setUser(userData);
      localStorage.setItem("currentUser", JSON.stringify(userData));

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      return { success: true, message: response.data.message || "Login successful", user: userData, token: response.data.token };
    } else {
      return { success: false, error: response.data?.message || "Login failed" };
    }
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || "Login failed" };
  }
};


  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

