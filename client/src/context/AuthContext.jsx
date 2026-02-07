import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("crm_token") || "");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      setUser({ email: "admin" });
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem("crm_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("crm_token");
    setToken("");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
