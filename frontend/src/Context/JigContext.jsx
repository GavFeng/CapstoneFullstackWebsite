import React, { createContext, useState, useEffect, useMemo } from 'react';
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
  const [savedItems, setSavedItems] = useState([]);

  /* ---------------- FETCH JIGS ---------------- */
  const fetchJigs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/jigs`);
      setJigs(res.data.jigs || res.data || []);
    } catch (err) {
      console.error('Failed to load jigs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJigs();
  }, []);

  const refreshJigs = fetchJigs;

  const refreshSingleJig = async (jigId) => {
    try {
      const res = await axios.get(`${API_URL}/jigs/${jigId}`);
      setJigs(prev =>
        prev.map(j => (j._id === jigId ? res.data : j))
      );
      return res.data;
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- LOAD CART & SAVED ITEMS ---------------- */
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    const loadCart = async () => {
      try {
        const res = await axios.get(`${API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const newCart = {};
        res.data.items?.forEach((item) => {
          const jigId = item.jig?._id || item.jig;
          const colorId = item.color?._id || item.color;
          newCart[`${jigId}-${colorId}`] = { 
            jigId, 
            colorId, 
            quantity: item.quantity 
          };
        });

        setCartItems(newCart);
        setSavedItems(res.data.savedItems || []);
      } catch (err) {
        console.error('Failed to load cart:', err);
      }
    };
    loadCart();
  }, [isAuthenticated, authLoading, token]);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      setCartItems({});
      setSavedItems([]);
    }
  }, [isAuthenticated, authLoading]);

  /* ---------------- HELPERS ---------------- */
  const getKey = (jigId, colorId) => `${jigId}-${colorId}`;

  const getAvailableStock = (jigId, colorId) => {
    const jig = jigs.find(j => j._id === jigId);
    const variant = jig?.colors?.find(v => v.color._id === colorId);
    return variant?.stock ?? 0;
  };

  /* ---------------- SAVED ITEMS ACTIONS ---------------- */
  const saveForLater = async (jigId, colorId) => {
    if (!isAuthenticated) return;
    const key = getKey(jigId, colorId);
    const itemToSave = cartItems[key];
    if (!itemToSave) return;

    try {
      const res = await axios.post(
        `${API_URL}/cart/save-for-later`,
        { jig: jigId, color: colorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 1. Remove from Cart
      setCartItems(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });

      // 2. Add to Saved Items immediately from server response
      setSavedItems(res.data.savedItems || []); 
    } catch (err) {
      console.error('Save for later failed:', err);
    }
  };

  const moveToCart = async (jigId, colorId, quantity = 1) => {
    if (!isAuthenticated) return;

    try {
      const res = await axios.post(
        `${API_URL}/cart/move-to-cart`,
        { jig: jigId, color: colorId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 1. Update Saved Items from response
      setSavedItems(res.data.savedItems || []);

      // 2. Add to Cart state locally
      const key = getKey(jigId, colorId);
      setCartItems(prev => ({
        ...prev,
        [key]: { jigId, colorId, quantity }
      }));
    } catch (err) {
      console.error('Move to cart failed:', err);
    }
  };

  const removeSavedItem = async (jigId, colorId) => {
    if (!isAuthenticated) return;

    try {
      await axios.delete(`${API_URL}/cart/saved-item`, {
        data: { jig: jigId, color: colorId },
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove from local state
      setSavedItems(prev => 
        prev.filter(item => 
          !((item.jig?._id || item.jig) === jigId && 
            (item.color?._id || item.color) === colorId)
        )
      );
    } catch (err) {
      console.error('Remove saved item failed:', err);
    }
  };

  /* ---------------- AUTO CLAMP CART ---------------- */
  useEffect(() => {
    setCartItems(prev => {
      const updated = { ...prev };
      let changed = false;

      Object.values(prev).forEach(item => {
        const available = getAvailableStock(item.jigId, item.colorId);
        if (available === 0) {
          // Keep item but maybe show warning in UI
        } else if (item.quantity > available) {
          updated[getKey(item.jigId, item.colorId)].quantity = available;
          changed = true;
        }
      });

      return changed ? updated : prev;
    });
  }, [jigs]);

  /* ---------------- SYNC ---------------- */
  const syncItem = async (jigId, colorId, quantity) => {
    if (!isAuthenticated) return;
    try {
      await axios.post(
        `${API_URL}/cart/item`,
        { jig: jigId, color: colorId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Sync failed:', err);
    }
  };

  const debouncedSync = useMemo(
    () => debounce(syncItem, 500),
    [isAuthenticated, token]
  );

  /* ---------------- CART ACTIONS ---------------- */
  const addToCart = async (jigId, colorId, qty = 1) => {
    const key = getKey(jigId, colorId);
    let available = getAvailableStock(jigId, colorId);

    if (available === 0) {
      await refreshSingleJig(jigId);
      await new Promise(resolve => setTimeout(resolve, 100));
      available = getAvailableStock(jigId, colorId);
    }

    setCartItems((prev) => {
      const current = prev[key]?.quantity || 0;
      const newQty = Math.min(current + qty, available || 0);

      if (newQty <= 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }

      const updated = {
        ...prev,
        [key]: { jigId, colorId, quantity: newQty },
      };

      syncItem(jigId, colorId, newQty);
      return updated;
    });
  };

  const setCartQuantity = (jigId, colorId, qty) => {
    setCartItems(prev => {
      const key = getKey(jigId, colorId);
      const available = getAvailableStock(jigId, colorId);
      const safeQty = Math.min(Math.max(0, qty), available);

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

      debouncedSync(jigId, colorId, safeQty);
      return updated;
    });
  };

  const removeAllFromCart = (jigId, colorId) => {
    setCartItems(prev => {
      const key = getKey(jigId, colorId);
      const { [key]: _, ...rest } = prev;
      return rest;
    });

    if (isAuthenticated) {
      axios.delete(`${API_URL}/cart/item`, {
        data: { jig: jigId, color: colorId },
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  };

  const clearCart = async () => {
    setCartItems({});
    setSavedItems([]);
    if (isAuthenticated) {
      await axios.delete(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  };

  const removePurchasedItems = async (items) => {
    setCartItems(prev => {
      const updated = { ...prev };
      items.forEach(i => delete updated[`${i.jig}-${i.color}`]);
      return updated;
    });

    if (isAuthenticated) {
      await axios.post(`${API_URL}/cart/remove-purchased`, { items }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  };

  /* ---------------- TOTALS ---------------- */
  const cartTotal = useMemo(() => {
    return Object.values(cartItems).reduce((sum, item) => {
      const jig = jigs.find(j => j._id === item.jigId);
      return jig ? sum + jig.price * item.quantity : sum;
    }, 0);
  }, [cartItems, jigs]);

  const totalItems = useMemo(() => {
    return Object.values(cartItems).reduce((sum, i) => sum + i.quantity, 0);
  }, [cartItems]);

  return (
    <JigContext.Provider
      value={{
        jigs,
        loading: loading || authLoading,
        cartItems,
        savedItems,
        addToCart,
        setCartQuantity,
        removeAllFromCart,
        clearCart,
        removePurchasedItems,
        saveForLater,
        moveToCart,
        removeSavedItem,
        cartTotal,
        totalItems,
        refreshJigs,
        refreshSingleJig,
        getAvailableStock,
      }}
    >
      {children}
    </JigContext.Provider>
  );
};

export default JigContextProvider;