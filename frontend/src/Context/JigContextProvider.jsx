import React, { useState, useEffect, useMemo } from 'react';
import api from '../Services/Api';
import debounce from 'lodash/debounce';
import { useAuth } from './AuthContext';
import { JigContext } from './JigContext';


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
      const res = await api.get(`jigs?all=true`);
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
      const res = await api.get(`jigs/${jigId}`);
      const freshData = res.data.jig || res.data; 

      setJigs(prev =>
        prev.map(j => (j._id === jigId ? freshData : j))
      );
    
      return freshData;
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- LOAD CART & SAVED ITEMS ---------------- */

  const loadCart = async (force = false) => {
    if (!force && (!isAuthenticated || authLoading)) return;
    try {
      const res = await api.get(`cart`);
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

  useEffect(() => {
    loadCart();
  }, [isAuthenticated, authLoading, token]);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      const saved = localStorage.getItem("localCart");
      if (saved) {
        const parsed = JSON.parse(saved);
        const newCart = {};
        parsed.forEach(item => {
          newCart[`${item.jigId}-${item.colorId}`] = item;
        });
        setCartItems(newCart);
      } else {
        setCartItems({});
      }
      setSavedItems([]);
    }
  }, [isAuthenticated, authLoading]);

  /* ---------------- HELPERS ---------------- */
  const getKey = (jigId, colorId) => `${jigId}-${colorId}`;

  const getAvailableStock = (jigId, colorId) => {
    const jig = jigs.find(j => String(j._id) === String(jigId));
    const variant = jig?.colors?.find(v => {
      const serverColorId = v.color?._id || v.color;
      return String(serverColorId) === String(colorId);
    });
    return variant?.stock ?? 0;
  };
  /* ---------------- SAVED ITEMS ACTIONS ---------------- */
  const saveForLater = async (jigId, colorId) => {
    if (!isAuthenticated) return;
    const key = getKey(jigId, colorId);
    const itemToSave = cartItems[key];
    if (!itemToSave) return;

    try {
      const res = await api.post(
        `cart/save-for-later`,
        { jig: jigId, color: colorId },
      );

      // Remove from Cart
      setCartItems(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });

      // Add to Saved Items immediately from server response
      setSavedItems(res.data.savedItems || []); 
    } catch (err) {
      console.error('Save for later failed:', err);
    }
  };

  const moveToCart = async (jigId, colorId, quantity = 1) => {
    if (!isAuthenticated) return;

    try {
      const res = await api.post(
        `cart/move-to-cart`,
        { jig: jigId, color: colorId, quantity },
      );

      // Update Saved Items from response
      setSavedItems(res.data.savedItems || []);

      // Add to Cart state locally
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
      await api.delete(`cart/saved-item`, {
        data: { jig: jigId, color: colorId },
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
      await api.post(
        `cart/item`,
        { jig: jigId, color: colorId, quantity },
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
    
    // Try to find it in our existing list
    let targetJig = jigs.find(j => String(j._id) === String(jigId));

    // If it's NOT in the list (pagination), fetch it specifically
    if (!targetJig) {
      targetJig = await refreshSingleJig(jigId); 
    }

    // Run stock check
    const variant = targetJig?.colors?.find(v => {
      const vColorId = v.color?._id || v.color;
      return String(vColorId) === String(colorId);
    });

    const available = variant?.stock ?? 0;

    if (available <= 0) return; // Out of stock or not found

    setCartItems(prev => {
      const current = prev[key]?.quantity || 0;
      const newQty = Math.min(current + qty, available);
      const updated = { ...prev, [key]: { jigId, colorId, quantity: newQty } };
      if (isAuthenticated) {
      syncItem(jigId, colorId, newQty);
      } else {
        localStorage.setItem("localCart", JSON.stringify(Object.values(updated)));
      }
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
      if (isAuthenticated) {
        debouncedSync(jigId, colorId, safeQty);
      } else {
        localStorage.setItem("localCart", JSON.stringify(Object.values(updated)));
      }
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
      api.delete(`cart/item`, {
        data: { jig: jigId, color: colorId },
      });
    }
  };

  const clearCart = async () => {
    setCartItems({}); 
    if (isAuthenticated) {
      try {
        await api.delete(`cart`);
      } catch (err) {
        console.error("Failed to clear cart:", err);
      }
    }
  };


  const removePurchasedItems = async (items) => {
    setCartItems(prev => {
      const updated = { ...prev };
      items.forEach(i => delete updated[`${i.jig}-${i.color}`]);
      return updated;
    });

    if (isAuthenticated) {
      try {
        const res = await api.post(`cart/remove-purchased`, { items });
        
        if (res.data.savedItems) {
          setSavedItems(res.data.savedItems);
        }
      } catch (err) {
        console.error("Failed to sync after purchase:", err);
      }
    }
  };
  /* ---------------- TOTALS ---------------- */
  const cartTotal = useMemo(() => {
    return Object.values(cartItems).reduce((sum, item) => {
      const jig = jigs.find(j => String(j._id) === String(item.jigId));
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
        loadCart,
      }}
    >
      {children}
    </JigContext.Provider>
  );
};

export default JigContextProvider;