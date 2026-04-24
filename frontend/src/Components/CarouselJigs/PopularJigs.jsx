import { useState, useEffect } from 'react';
import Carousel from '../Carousel/Carousel';
import Item from '../Item/Item';
import api from '../../Services/Api';
import { useTranslation } from 'react-i18next';

const PopularJigs = () => {

  const { t } = useTranslation();

  /* ---------- STATE ---------- */

  const [popularJigs, setPopularJigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  /* ---------- EFFECT ---------- */
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        // Fetch top 12 newest jigs 
        const res = await api.get(`jigs/popular?limit=12`); 
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
  if (loading) return <div className="text-center py-12">{t('common.loadingPopular')}</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;

  return (
    <Carousel 
      title="home.popularJigsTitle"
      items={popularJigs} 
      ItemComponent={Item} 
    />
  )
}

export default PopularJigs