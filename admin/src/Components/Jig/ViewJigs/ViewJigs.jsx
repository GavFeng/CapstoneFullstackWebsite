import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import {
  DeleteJig,
  ImagePopup,
  InventoryEditor,
  ViewJigsFilters,
  SoldEditorModal,
} from '../components';


import './ViewJigs.css';

const API_URL = 'http://localhost:4000/api';

const ViewJigs = () => {
  const navigate = useNavigate();

  // Filter state
  const [filters, setFilters] = useState({
    category: '',
    weight: '',
    color: '',
    minPrice: '',
    maxPrice: '',
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJigs, setTotalJigs] = useState(0);
  // Data
  const [jigs, setJigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [weights, setWeights] = useState([]);
  const [colors, setColors] = useState([]);

  const [soldModal, setSoldModal] = useState(null);
  const [popupImage, setPopupImage] = useState(null);

  /* ---------- EFFECTS ---------- */
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, weightRes, colorRes] = await Promise.all([
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/weights`),
          axios.get(`${API_URL}/colors`),
        ]);

        setCategories(catRes.data);
        setWeights(weightRes.data.sort((a, b) => a.value - b.value));
        setColors(colorRes.data);
      } catch (err) {
        console.error('Failed to load filter options:', err);
      } finally {
        setFilterOptionsLoading(false);
      }
    };

    fetchOptions();
  }, []);

const fetchJigs = useCallback(async () => {
  setLoading(true);
  const LIMIT = 10; // <--------------- Change Limit Here

  try {
    const params = {
      page,
      limit: LIMIT,
      ...(filters.category && { category: filters.category }),
      ...(filters.weight   && { weight:   filters.weight }),
      ...(filters.color    && { color:    filters.color }),
      ...(filters.minPrice && { minPrice: Number(filters.minPrice) }),
      ...(filters.maxPrice && { maxPrice: Number(filters.maxPrice) }),
    };

    const res = await axios.get(`${API_URL}/jigs`, { params });

    const receivedJigs = Array.isArray(res.data?.jigs) ? res.data.jigs : [];

    setJigs(prev => 
      page === 1 
        ? receivedJigs 
        : [...prev, ...receivedJigs]
    );

    const total = Number(res.data?.total) || 0;
    const calcTotalPages = total > 0 ? Math.ceil(total / LIMIT) : 1;

    setTotalJigs(total); 
    setTotalPages(calcTotalPages);
    setHasMore(page < calcTotalPages);

  } catch (err) {
    console.error('Error fetching jigs:', err);
    if (page === 1) {
      setJigs([]);
      setTotalJigs(0);
    }
    setHasMore(false);
  } finally {
    setLoading(false);
  }
}, [filters, page]);

  useEffect(() => {

    setPage(1);
    setJigs([]);
    setHasMore(true);
  }, [filters]);

  useEffect(() => {
    if (page >= 1) {
      fetchJigs();
    }
  }, [fetchJigs, page]);


  /* ----------  HANDLERS ---------- */
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? '' : value,
    }));
  };

  const handleReset = () => {
    setFilters({
      category: '',
      weight: '',
      color: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  const handleDeleteSuccess = (deletedId) => {
    setJigs(prev => prev.filter(j => j._id !== deletedId));
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  if (filterOptionsLoading) return <p>Loading filter options...</p>;

  return (
    <div className="jigs-page">
      <ViewJigsFilters
        categories={categories}
        weights={weights}
        colors={colors}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />
      {!loading && jigs.length > 0 && (
      <div className="showing-info">
          Showing <strong>{jigs.length}</strong> out of <strong>{totalJigs}</strong>
          {jigs.length === totalJigs && totalJigs > 0 && " (All)"}
        </div>
      )}

      <div className="jigs-container">
        {jigs.length === 0 && !loading && <p>No jigs match the current filters.</p>}

        {jigs.map(jig => {
          const totalSold = jig.colors.reduce((sum, c) => sum + (c.sold || 0), 0);
          const breakdown = jig.colors
            .map(c => `${c.color?.name || 'Unnamed'}: ${c.sold || 0} sold`)
            .join('\n');
          
            
          return (
            <div key={jig._id} className="jig-card">
              <div className="jig-header">
                <div className="jig-header-left">
                  <h3>{jig.name}</h3>
                  <p>${jig.price}</p>
                </div>
                <div className="jig-header-right">
                  <button
                    className="edit-btn"
                    onClick={() => navigate(`/editjig/${jig._id}`)}
                  >
                    Edit
                  </button>
                  <DeleteJig
                    jigId={jig._id}
                    jigName={jig.name}
                    onDeleteSuccess={handleDeleteSuccess}
                  />
                </div>
              </div>

              <p className="jig-desc">{jig.description}</p>
              <p className="jig-info">
                Category: <strong>{jig.category?.name}</strong> | Weight: <strong>{jig.weight?.label}</strong>
              </p>

              <div className="jig-total-sold-wrapper">
                <p className="jig-total-sold">
                  Total Sold: <strong>{totalSold}</strong>
                  <span className="sold-breakdown-tooltip" data-tooltip={breakdown || 'No sales recorded'}>
                    ⓘ
                  </span>
                </p>
                <button
                  className="edit-sold-btn"
                  onClick={() =>
                    setSoldModal({
                      jigId: jig._id,
                      jigName: jig.name,
                      colors: jig.colors
                    })
                  }
                >
                  Modify Sold
                </button>
              </div>

              <div className="colors-section">
                <h4>Colors & Stock:</h4>
                <div className="colors-list">
                  {jig.colors.map(c => (
                    <div key={c.color?._id || c.color} className="color-item">
                      <div className="color-info">
                        <div
                          className="color-swatch"
                          style={{ backgroundColor: c.color?.slug || '#ccc' }}
                        />
                        <span>{c.color?.name}</span>
                      </div>

                      <div className="stock-center">
                        <InventoryEditor
                          jigId={jig._id}
                          colorId={c.color?._id || c.color}
                          stock={c.stock}
                          sold={c.sold}
                          onUpdate={updatedJig => {
                            setJigs(prev =>
                              prev.map(j => (j._id === updatedJig._id ? updatedJig : j))
                            );
                          }}
                        />
                      </div>

                      <div className="color-images">
                        {c.images?.map((imgObj, idx) => (
                          <img
                            key={imgObj.key || idx}
                            src={imgObj.url}
                            alt={c.color?.name || `color-${idx}`}
                            onClick={() => setPopupImage(imgObj.url)}
                            className="clickable-image"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

      </div>
      {loading && <p className="loading">Loading...</p>}
      {hasMore && jigs.length > 0 && (
        <div className="load-more-container">
          <button 
            className="load-more-btn" 
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? 'Loading more...' : 'Load More'}
          </button>
        </div>
      )}
      {popupImage && <ImagePopup src={popupImage} onClose={() => setPopupImage(null)} />}
      {soldModal && (
        <SoldEditorModal
          jigId={soldModal.jigId}
          jigName={soldModal.jigName}
          colors={soldModal.colors}
          onClose={() => setSoldModal(null)}
          onSuccess={(updatedJig) => {
            setJigs(prev =>
              prev.map(j => (j._id === updatedJig._id ? updatedJig : j))
            );
          }}
        />
      )}
    
    </div>
  );
};

export default ViewJigs;