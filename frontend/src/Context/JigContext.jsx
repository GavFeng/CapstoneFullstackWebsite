import React, { createContext, useState, useEffect, useMemo, useContext} from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { useAuth } from './AuthContext';

export const JigContext = createContext(null);

const API_URL = 'http://localhost:4000/api';

export const JigContextProvider = ({ children }) => {

  const { user, loading: authLoading } = useAuth();

  const isAuthenticated = !!user;                  
  const token = localStorage.getItem('token');

  const [jigs, setJigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState({});

  useEffect(() => {
    const fetchJigs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/jigs`);
        const received = Array.isArray(res.data?.jigs)
          ? res.data.jigs
          : Array.isArray(res.data)
            ? res.data
            : [];
        setJigs(received);
      } catch (err) {
        console.error('Failed to load jigs:', err);
        setJigs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJigs();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    const loadServerCart = async () => {
      try {
        const res = await axios.get(`${API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const serverCart = res.data;
        const newCart = {};

        serverCart.items?.forEach((item) => {
          const jigId = item.jig?._id || item.jig;
          const colorId = item.color?._id || item.color;
          const key = `${jigId}-${colorId}`;

          newCart[key] = {
            jigId,
            colorId,
            quantity: item.quantity,
          };
        });

        setCartItems(newCart);
      } catch (err) {
        console.error('Failed to load server cart:', err);
      }
    };

    loadServerCart();
  }, [isAuthenticated, authLoading, token]);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      setCartItems({});
    }
  }, [isAuthenticated, authLoading]);

  const getCartKey = (jigId, colorId) => `${jigId}-${colorId}`;

  const getAvailableStock = (jigId, colorId) => {
    const jig = jigs.find(j => j._id === jigId);
    if (!jig) return 0;
    const variant = jig.colors?.find(v => v.color._id === colorId);
    return variant?.stock ?? 0;
  };

  const syncItem = async (jigId, colorId, quantity) => {
    if (!isAuthenticated || !token) return;

    try {
      await axios.post(
        `${API_URL}/cart/item`,
        { jig: jigId, color: colorId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Cart item sync failed:', err);
      // toast notification maybe added later here
    }
  };

  const debouncedSyncQuantity = useMemo(
    () =>
      debounce((jigId, colorId, qty) => {
        syncItem(jigId, colorId, qty);
      }, 700),
    [isAuthenticated, token]
  );

  const addToCart = (jigId, colorId, quantity = 1) => {
    setCartItems((prev) => {
      const key = getCartKey(jigId, colorId);
      const current = prev[key]?.quantity || 0;
      const available = getAvailableStock(jigId, colorId);
      const newQty = Math.min(current + Math.max(0, quantity), available);

      if (newQty === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }

      const updated = {
        ...prev,
        [key]: { jigId, colorId, quantity: newQty },
      };

      // optimistic → sync
      if (isAuthenticated) {
        syncItem(jigId, colorId, newQty);
      }

      return updated;
    });
  };

  const removeFromCart = (jigId, colorId) => {
    addToCart(jigId, colorId, -1);
  };

  const removeAllFromCart = (jigId, colorId) => {
    setCartItems((prev) => {
      const key = getCartKey(jigId, colorId);
      const { [key]: _, ...rest } = prev;
      return rest;
    });

    if (isAuthenticated) {
      axios
        .delete(`${API_URL}/cart/item`, {
          data: { jig: jigId, color: colorId },
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch((err) => console.error("Remove failed", err));
    }
  };

  const setCartQuantity = (jigId, colorId, newQuantity) => {
    setCartItems((prev) => {
      const key = getCartKey(jigId, colorId);
      const available = getAvailableStock(jigId, colorId);
      const qty = Math.max(0, Number(newQuantity) || 0);
      const safeQty = Math.min(qty, available);

      let updated;
      if (safeQty === 0) {
        const { [key]: _, ...rest } = prev;
        updated = rest;
      } else {
        updated = {
          ...prev,
          [key]: { jigId, colorId, quantity: safeQty },
        };
      }

      if (isAuthenticated) {
        debouncedSyncQuantity(jigId, colorId, safeQty);
      }

      return updated;
    });
  };

  const cartTotal = useMemo(() => {
    return Object.values(cartItems).reduce((sum, entry) => {
      const jig = jigs.find(j => j._id === entry.jigId);
      return jig ? sum + jig.price * entry.quantity : sum;
    }, 0);
  }, [cartItems, jigs]);

  const totalItems = useMemo(() => {
    return Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const value = {
    jigs,
    loading: loading || authLoading,
    cartItems,
    addToCart,
    removeFromCart,
    removeAllFromCart,
    setCartQuantity,
    cartTotal,
    totalItems,
  };

  return <JigContext.Provider value={value}>{children}</JigContext.Provider>;
};

export default JigContextProvider;