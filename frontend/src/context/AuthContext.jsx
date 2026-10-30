import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("borrowbox_token") || "");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("borrowbox_user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const savedToken = localStorage.getItem("borrowbox_token");
      if (!savedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await API.get("/students/me");
        setUser(response.data);
        localStorage.setItem("borrowbox_user", JSON.stringify(response.data));
      } catch (err) {
        console.warn("Failed to verify current session:", err.message);
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [token]);

  const login = (newToken, studentData) => {
    localStorage.setItem("borrowbox_token", newToken);
    if (studentData) {
      localStorage.setItem("borrowbox_user", JSON.stringify(studentData));
      setUser(studentData);
    }
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("borrowbox_token");
    localStorage.removeItem("borrowbox_user");
    localStorage.removeItem("borrowbox_mfa_setup_token");
    setToken("");
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser(updatedData);
    localStorage.setItem("borrowbox_user", JSON.stringify(updatedData));
  };

  const isSupervisor = user?.role === "supervisor" || user?.role === "admin";
  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated,
        isSupervisor,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

