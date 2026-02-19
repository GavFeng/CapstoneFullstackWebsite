import React, { useEffect, useState } from "react";
import axios from "axios";
import { JigContext } from "./JigContext";

const JigContextProvider = ({ children }) => {
  const [jigs, setJigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchJigs = async () => {
  try {
    const res = await axios.get("http://localhost:4000/api/jigs");

    const receivedJigs = Array.isArray(res.data?.jigs)
    ? res.data.jigs
    : Array.isArray(res.data)
        ? res.data
        : [];

    setJigs(receivedJigs);

  } catch (err) {
    console.error("Error fetching jigs:", err);
    setJigs([]);
  } finally {
    setLoading(false);
  }
  };

  fetchJigs();
  }, []);

  return (
    <JigContext.Provider value={{ jigs, loading }}>
      {children}
    </JigContext.Provider>
  );
};

export default JigContextProvider;