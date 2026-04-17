import React, { useState, useEffect } from 'react';
import api from '../../Services/Api';
import Carousel from '../Carousel/Carousel';
import Item from '../Item/Item';


const RelatedProducts = ({ jig }) => {

  /* ---------- STATE ---------- */

  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------- EFFECT ---------- */
  useEffect(() => {
    // Guard: Check if required jig data exists before making request
    if (!jig?._id || !jig?.weight?._id || !jig?.category?._id) {
      setRelated([]);
      setLoading(false);
      return;
    }

    // Prevent state updates if component unmounts or dependencies change
    let isCurrent = true;

    const fetchRelated = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch 8 related jigs based on current jig ID
        const res = await api.get(
          `jigs/related/${jig._id}`,
          { params: { limit: 8 } }
        );

        const data = res.data;

        if (!isCurrent) return;

        // Ensure API returns expected array format
        if (Array.isArray(data)) {
          setRelated(data);
        } else {
          console.warn("Related endpoint did not return an array:", data);
          setRelated([]);
        }

      } catch (err) {
        console.error("Error fetching related jigs:", err);

        if (!isCurrent) return;

        // Set user-facing error message
        setError("Could not load related products");
        setRelated([]);

      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    fetchRelated();

    // Cleanup: mark request as stale to avoid race conditions
    return () => {
      isCurrent = false;
    };

  }, [jig?._id, jig?.weight?._id, jig?.category?._id]);


  /* ----------  JSX ----------  */
  if (loading) return <div className="text-center py-8">Loading related jigs…</div>;
  if (error || related.length === 0) return null;
  

  return (
    <Carousel
      title="Related Jigs"
      items={related}
      ItemComponent={Item}
    />
  );
}

export default RelatedProducts