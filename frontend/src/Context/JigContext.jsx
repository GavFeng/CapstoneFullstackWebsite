import React, { createContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';

export const JigContext = createContext(null);

const API_URL = 'http://localhost:4000/api';

export const JigContextProvider = ({ children }) => {
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

  const getCartKey = (jigId, colorId) => `${jigId}-${colorId}`;

  const getAvailableStock = (jigId, colorId) => {
    const jig = jigs.find(j => j._id === jigId);
    if (!jig) return 0;
    const variant = jig.colors?.find(v => v.color._id === colorId);
    return variant?.stock ?? 0;
  };

  const addToCart = (jigId, colorId, quantity = 1) => {
    const key = getCartKey(jigId, colorId);
    const currentQty = cartItems[key]?.quantity || 0;
    const available = getAvailableStock(jigId, colorId);

    const newQty = Math.min(
      currentQty + Math.max(0, quantity),
      available
    );

    if (newQty === 0) {
      setCartItems(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
      return;
    }

    setCartItems(prev => ({
      ...prev,
      [key]: {
        jigId,
        colorId,
        quantity: newQty,
      },
    }));
  };

  const removeFromCart = (jigId, colorId) => {
    addToCart(jigId, colorId, -1);
  };

  const removeAllFromCart = (jigId, colorId) => {
    const key = getCartKey(jigId, colorId);
    setCartItems(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  const setCartQuantity = (jigId, colorId, newQuantity) => {
    const key = getCartKey(jigId, colorId);
    const available = getAvailableStock(jigId, colorId);
    const qty = Math.max(0, Number(newQuantity) || 0);
    const safeQty = Math.min(qty, available);

    setCartItems(prev => {
      if (safeQty === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [key]: {
          jigId,
          colorId,
          quantity: safeQty,
        },
      };
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
    loading,
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