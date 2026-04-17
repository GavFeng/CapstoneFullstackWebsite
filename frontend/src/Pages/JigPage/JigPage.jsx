import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { JigContext } from "../../Context/JigContext";
import api from '../../Services/Api';
import Breadcrumb from '../../Components/BreadCrumb/BreadCrumb';
import ProductDisplay from '../../Components/ProductDisplay/ProductDisplay';
import DescriptionBox from '../../Components/DescriptionBox/DescriptionBox';
import RelatedProducts from '../../Components/CarouselJigs/RelatedProducts';

const JigPage = () => {
  const { refreshSingleJig } = useContext(JigContext);
  const { id } = useParams();
  const [jig, setJig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!id) return;

    const fetchJig = async () => {
      try {
        setLoading(true);
        const res = await api.get(`jigs/${id}`);
        setJig(res.data);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.status === 404
            ? 'Jig not found'
            : 'Failed to load product details'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJig();
  }, [id]);

  useEffect(() => {
    refreshSingleJig(id);
  }, []);

  if (loading) return <div className="loading">Loading product details...</div>;
  if (error)   return <div className="error">{error} <Link to="/jigs">Back to shop</Link></div>;
  if (!jig)    return <div className="not-found">Product not found</div>;

  return (
    <div className="product-detail-container">
      <Breadcrumb jig={jig} />
      <ProductDisplay jig={jig} />
      <DescriptionBox jig={jig} />
      <RelatedProducts jig={jig} />
    </div>
  );
};

export default JigPage;