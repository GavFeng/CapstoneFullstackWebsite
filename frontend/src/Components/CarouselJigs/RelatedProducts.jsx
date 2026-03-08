import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Carousel from '../Carousel/Carousel';
import Item from '../Item/Item';


const API_URL = "http://localhost:4000/api";

const RelatedProducts = ({ jig }) => {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jig?._id || !jig?.weight?._id || !jig?.category?._id) {
      setRelated([]);
      setLoading(false);
      return;
    }

    let isCurrent = true;

    const fetchRelated = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${API_URL}/jigs/related/${jig._id}`, {
          params: { limit: 8 },
        });

        const data = res.data;

        if (isCurrent) {
          if (Array.isArray(data)) {
            setRelated(data);
          } else {
            console.warn('Related endpoint did not return an array:', data);
            setRelated([]);

          }
        }
      } catch (err) {
        console.error('Error fetching related jigs:', err);
        if (isCurrent) {
          setError('Could not load related products');
          setRelated([]); 
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    fetchRelated();

    return () => {
      isCurrent = false;
    };
  }, [jig?._id, jig?.weight?._id, jig?.category?._id]);

  if (loading) {
    return <div className="text-center py-8">Loading related jigs…</div>;
  }

  if (error || related.length === 0) {
    return null;
  }

  return (
    <Carousel
      title="Related Jigs"
      items={related}
      ItemComponent={Item}
    />
  );
};

export default RelatedProducts;