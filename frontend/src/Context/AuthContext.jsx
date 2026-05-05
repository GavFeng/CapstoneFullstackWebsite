import { createContext, useState, useEffect, useContext } from 'react';
import api from '../Services/Api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  /* ---------- STATE ---------- */
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /* ---------- EFFECTS ---------- */
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/users/me");
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);


  /* ---------- LOGIN ---------- */

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/users/login", { email, password });
      localStorage.setItem("token", data.token);
      setUser(data.user);

      const localCart = JSON.parse(localStorage.getItem("localCart") || "[]");
      if (localCart.length > 0) {
        const mergedItems = localCart.map(item => ({
          jig: item.jigId,
          color: item.colorId,
          quantity: item.quantity
        }));

        try {
          await api.post("/cart/merge", { localItems: mergedItems });
          localStorage.removeItem("localCart"); 
        } catch (mergeErr) {
          console.error("Cart merge failed", mergeErr);
        }
      }
      navigate("/");
    } catch (err) {
      console.error(err);
      throw err?.response?.data?.message || "Login failed";
    }
  };

  /* ---------- Register ---------- */
  const register = async (name, username, email, password) => {
    try {
      const { data } = await api.post("/users/register", {
        name,
        username,
        email,
        password,
      });
      localStorage.setItem("token", data.token);
      setUser(data.user);

      const localCart = JSON.parse(localStorage.getItem("localCart") || "[]");
      if (localCart.length > 0) {
        const mergedItems = localCart.map(item => ({
          jig: item.jigId,
          color: item.colorId,
          quantity: item.quantity
        }));
        
        await api.post("/cart/merge", { localItems: mergedItems });
        localStorage.removeItem("localCart");
      }
      navigate("/");
    } catch (err) {
      throw err?.response?.data?.message || "Registration failed";
    }
  };

  /* ---------- LOG OUT ---------- */
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };


  /* ---------- Update Profile ---------- */
  const updateProfile = async (userData) => {
    try {
      const { data } = await api.put("/users/profile", userData);
      setUser(data); 
      return data;
    } catch (err) {
      throw err?.response?.data?.message || "Update failed";
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAdmin: user?.accountType === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);