import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Item from '../../Components/Item/Item';
import './JigCategory.css';

const API_URL = 'http://localhost:4000/api';

const JigCategory = () => {
  const [filters, setFilters] = useState({
    category: '',
    weight: '',
    color: '',
    minPrice: '',
    maxPrice: '',
  });

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalJigs, setTotalJigs] = useState(0);

  const [jigs, setJigs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [weights, setWeights] = useState([]);
  const [colors, setColors] = useState([]);
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);

  const LIMIT = 12;

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

    try {
      const params = {
        page,
        limit: LIMIT,
        ...(filters.category && { category: filters.category }),
        ...(filters.weight && { weight: filters.weight }),
        ...(filters.color && { color: filters.color }),
        ...(filters.minPrice && { minPrice: Number(filters.minPrice) }),
        ...(filters.maxPrice && { maxPrice: Number(filters.maxPrice) }),
      };

      const res = await axios.get(`${API_URL}/jigs`, { params });

      const received = Array.isArray(res.data?.jigs) ? res.data.jigs : [];

      setJigs((prev) => (page === 1 ? received : [...prev, ...received]));

      const total = Number(res.data?.total) || 0;
      setTotalJigs(total);
      setHasMore(page < Math.ceil(total / LIMIT));
    } catch (err) {
      console.error('Error fetching jigs:', err);
      setJigs(page === 1 ? [] : prev);
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
    if (page >= 1) fetchJigs();
  }, [fetchJigs, page]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
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

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  if (filterOptionsLoading) return <p className="loading-text">Loading filters...</p>;

  return (
    <div className="jig-category-page">
      <div className="layout-container">
        {/* Left Side – Filters */}
        <aside className="filters-sidebar">
          <h2 className="filters-title">Filters</h2>

          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Weight</label>
            <select
              value={filters.weight || ''}
              onChange={(e) => handleFilterChange('weight', e.target.value)}
            >
              <option value="">All Weights</option>
              {weights.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Color</label>
            <select
              value={filters.color || ''}
              onChange={(e) => handleFilterChange('color', e.target.value)}
            >
              <option value="">All Colors</option>
              {colors.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group price-range">
            <label>Price Range</label>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
              <span>–</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
          </div>

          <button className="reset-btn" onClick={handleReset}>
            Reset Filters
          </button>
        </aside>

        {/* Main Area */}
        <main className="products-main">
          {!loading && jigs.length > 0 && (
            <p className="jig-count">
              Showing <strong>{jigs.length}</strong> of <strong>{totalJigs}</strong>
              {jigs.length === totalJigs && totalJigs > 0 && ' (all)'}
            </p>
          )}

          {loading && page === 1 && <p className="loading-text">Loading products...</p>}

          {jigs.length === 0 && !loading && (
            <p className="loading-text">No products match the selected filters.</p>
          )}

          <div className="jig-grid">
            {jigs.map((jig) => (
              <Item
                key={jig._id}
                id={jig._id}
                name={jig.name}
                price={jig.price}
                colors={jig.colors}
              />
            ))}
          </div>

          {hasMore && !loading && jigs.length > 0 && (
            <div className="load-more-wrapper">
              <button
                className="load-more-btn"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default JigCategory