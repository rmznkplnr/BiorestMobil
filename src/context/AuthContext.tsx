import React, { createContext, useState, useContext } from 'react';

interface AuthContextData {
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      // Burada gerçek API çağrısı yapılacak
      // Şimdilik sadece başarılı login simülasyonu yapıyoruz
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoggedIn(true);
    } catch (error) {
      throw new Error('Login başarısız oldu');
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 