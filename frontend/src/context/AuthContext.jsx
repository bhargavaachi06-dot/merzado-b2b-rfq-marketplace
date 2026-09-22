import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load existing credentials on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedTokens = localStorage.getItem('merzado_tokens');
      const storedUser = localStorage.getItem('merzado_user');

      if (storedTokens && storedUser) {
        try {
          setTokens(JSON.parse(storedTokens));
          setUser(JSON.parse(storedUser));

          // Verify token validity by calling /auth/me/
          const response = await axiosClient.get('/auth/me/');
          setUser(response.data);
          localStorage.setItem('merzado_user', JSON.stringify(response.data));
        } catch (err) {
          console.warn('Existing session invalid or expired:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axiosClient.post('/auth/login/', { username, password });
      const { access, refresh, user: loggedUser } = response.data;
      const tokenData = { access, refresh };

      setTokens(tokenData);
      setUser(loggedUser);

      localStorage.setItem('merzado_tokens', JSON.stringify(tokenData));
      localStorage.setItem('merzado_user', JSON.stringify(loggedUser));

      return { success: true, user: loggedUser };
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        'Invalid credentials. Please try again.';
      return { success: false, error: errorMsg };
    }
  };

  const register = async (registrationData) => {
    try {
      const response = await axiosClient.post('/auth/register/', registrationData);
      const { tokens: newTokens, user: registeredUser } = response.data;

      setTokens(newTokens);
      setUser(registeredUser);

      localStorage.setItem('merzado_tokens', JSON.stringify(newTokens));
      localStorage.setItem('merzado_user', JSON.stringify(registeredUser));

      return { success: true, user: registeredUser };
    } catch (error) {
      let errorMsg = 'Registration failed. Please check the form fields.';
      if (error.response?.data) {
        const errors = error.response.data;
        if (typeof errors === 'object') {
          const firstKey = Object.keys(errors)[0];
          const firstVal = errors[firstKey];
          errorMsg = Array.isArray(firstVal) ? `${firstKey}: ${firstVal[0]}` : `${firstKey}: ${firstVal}`;
        }
      }
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('merzado_tokens');
    localStorage.removeItem('merzado_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isBuyer: user?.role === 'BUYER',
        isSupplier: user?.role === 'SUPPLIER',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
