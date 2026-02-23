import React from 'react';
import './ViewJigsFilters.css';

const ViewJigsFilters = ({ categories, weights, colors, filters, onFilterChange, onReset, }) => {
  return (
    <div className="jigs-filters">
      <div className="filter-group">
        <label>Category</label>
        <select
          value={filters.category || ''}
          onChange={(e) => onFilterChange('category', e.target.value)}
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
          onChange={(e) => onFilterChange('weight', e.target.value)}
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
          onChange={(e) => onFilterChange('color', e.target.value)}
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
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
          />
          <span>–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
          />
        </div>
      </div>

      <button className="reset-btn" onClick={onReset}>
        Reset Filters
      </button>
    </div>
  )
}

export default ViewJigsFilters