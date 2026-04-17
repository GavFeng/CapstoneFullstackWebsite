import React, { useEffect, useState } from 'react';
import api from '../../Services/api';
import { InventoryEditor } from '../Jig/components';
import './ManageStock.css';

const ManageStock = () => {
  const [jigs, setJigs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const STOCK_THRESHOLD = 20; 

  const fetchStockData = async () => {
    try {
      setLoading(true);
      const res = await api.get('jigs', { params: { limit: 30 } });
      setJigs(res.data.jigs || []);
    } catch (err) {
      console.error("Error fetching inventory data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  const lowStockItems = jigs.flatMap(jig => 
    jig.colors
      .filter(c => c.stock <= STOCK_THRESHOLD)
      .map(c => ({
        ...c,
        jigName: jig.name,
        jigId: jig._id,
        weightLabel: jig.weight?.label || 'N/A'
      }))
  ).sort((a, b) => a.stock - b.stock);

  const bestSellers = [...jigs].sort((a, b) => {
    const totalA = a.colors.reduce((sum, c) => sum + (c.sold || 0), 0);
    const totalB = b.colors.reduce((sum, c) => sum + (c.sold || 0), 0);
    return totalB - totalA;
  }).slice(0, 8);

  if (loading) return <div className="stock-loading">Gathering Inventory Data...</div>;

  return (
    <div className="manage-stock-page">
      <header className="stock-header">
        <h1>Inventory Dashboard</h1>
        <button className="refresh-btn" onClick={fetchStockData}>↻ Refresh Data</button>
      </header>

      <div className="stock-grid">
        {/* LEFT SIDE: RESTOCK ALERTS */}
        <section className="stock-card-container">
          <div className="card-title-area">
            <h2 className="alert-text">⚠️ Restock Alerts</h2>
            <span className="count-badge">{lowStockItems.length} items low</span>
          </div>
          <div className="scrollable-list">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item, idx) => (
                <div key={`${item.jigId}-${item.color?._id}-${idx}`} className="restock-row">
                  <div className="item-meta">
                    <strong>{item.jigName}</strong>
                    <div className="item-sub-meta">
                      <span className="swatch" style={{ backgroundColor: item.color?.slug }}></span>
                      {item.color?.name} • {item.weightLabel}
                    </div>
                  </div>
                  <div className="editor-housing">
                    <InventoryEditor 
                      jigId={item.jigId}
                      colorId={item.color?._id || item.color}
                      stock={item.stock}
                      onUpdate={fetchStockData} 
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-msg">✅ All inventory levels are healthy.</p>
            )}
          </div>
        </section>

        {/* RIGHT SIDE: TOP SELLERS */}
        <section className="stock-card-container">
          <div className="card-title-area">
            <h2 className="success-text">🔥 Top Sellers</h2>
            <span className="count-badge">By Units Sold</span>
          </div>
          <div className="scrollable-list">
            {bestSellers.map(jig => {
              const totalJigSold = jig.colors.reduce((sum, c) => sum + (c.sold || 0), 0);
              return (
                <div key={jig._id} className="seller-card">
                  <div className="seller-info">
                    <h3>{jig.name}</h3>
                    <span className="total-sold-pill">{totalJigSold} sold total</span>
                  </div>
                  <div className="color-sold-breakdown">
                    {jig.colors
                      .filter(c => c.sold > 0)
                      .sort((a, b) => b.sold - a.sold)
                      .map(c => (
                        <div key={c._id} className="mini-sold-row">
                          <span className="dot" style={{ backgroundColor: c.color?.slug }}></span>
                          <span className="c-name">{c.color?.name}:</span>
                          <strong>{c.sold}</strong>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ManageStock