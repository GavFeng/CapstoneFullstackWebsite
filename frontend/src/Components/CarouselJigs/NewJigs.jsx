import { useState, useEffect } from 'react';
import Carousel from '../Carousel/Carousel';
import Item from '../Item/Item';
import api from '../../Services/Api';

const NewestJigs = () => {

  /* ---------- STATE ---------- */
  
  const [newJigs, setNewJigs] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- EFFECT ---------- */
  useEffect(() => {
    const fetchNewest = async () => {
      try {
        // Fetch top 10 newest jigs 
        const res = await api.get(`jigs/newest?limit=10`);
        setNewJigs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewest();
  }, []);
  
  /* ----------  JSX ----------  */
  if (loading) return <div className="text-center py-12">Loading new jigs...</div>;

  return (
    <Carousel 
      title="New Jigs" 
      items={newJigs} 
      ItemComponent={Item} 
    />
  );
};

export default NewestJigs;