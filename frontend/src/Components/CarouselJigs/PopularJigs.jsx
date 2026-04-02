import { useState, useEffect } from 'react';
import Carousel from '../Carousel/Carousel';
import Item from '../Item/Item';
import axios from 'axios';

/* ---------- API ---------- */
const API_URL = "http://localhost:4000/api";

const PopularJigs = () => {

  /* ---------- STATE ---------- */

  const [popularJigs, setPopularJigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  /* ---------- EFFECT ---------- */
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        // Fetch top 12 newest jigs 
        const res = await axios.get(`${API_URL}/jigs/popular?limit=12`); 
        setPopularJigs(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load popular jigs');
      } finally {
        setLoading(false);
      }
    };

    fetchPopular();
  }, []);

  /* ----------  JSX ----------  */
  if (loading) return <div className="text-center py-12">Loading popular jigs...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;

  return (
    <Carousel 
      title="Popular Jigs" 
      items={popularJigs} 
      ItemComponent={Item} 
    />
  )
}

export default PopularJigs