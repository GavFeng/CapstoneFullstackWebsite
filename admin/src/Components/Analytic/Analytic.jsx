import React, { useEffect, useState } from 'react';
import api from '../../Services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './Analytic.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytic = () => {

  /* ---------- STATE ---------- */
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);


  /* ---------- FETCH + EFFECT ---------- */

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/global-stats');
      console.log("Frontend received:", res.data.monthlySales);
      setData(res.data);
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const { 
    global = {}, 
    topColors = [], 
    locationPopularity = [], 
    weightStats = [], 
    monthlySales = [] 
  } = data || {};

  /* ---------- CHART CONFIGURATIONS ---------- */

  const salesTrendData = {
    labels: (monthlySales || []).map(s => s._id),
    datasets: [{
      label: 'Revenue ($)',
      data: (monthlySales || []).map(s => s.revenue),
      borderColor: '#3498db',
      backgroundColor: 'rgba(52, 152, 219, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const weightData = {
    labels: (weightStats || []).map(w => w._id),
    datasets: [{
      label: 'Units Sold',
      data: (weightStats || []).map(w => w.unitsSold),
      backgroundColor: '#9b59b6',
      borderRadius: 5
    }]
  };

  const colorData = {
    labels: topColors.map(c => c.name),
    datasets: [{
      label: 'Units Sold',
      data: topColors.map(c => c.totalSold),
      backgroundColor: topColors.map(c => c.slug || '#CCCCCC'), 
      borderColor: '#ffffff',
      borderWidth: 2,
      hoverOffset: 15
    }]
  };

  /* ----------  JSX ----------  */

  
  if (loading) return <div className="loading-screen">Gathering Insights...</div>;
  if (!data) return <div className="error-screen">Failed to load statistics.</div>;
  
  return (
    <div className="analytics-container">
      <header className="analytics-header">
        <div>
          <h1>Business Insights</h1>
        </div>
        <button className="refresh-btn" onClick={fetchStats}>↻ Refresh Data</button>
      </header>

      {/* KPI SECTION */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Total Units Sold</span>
          <span className="kpi-value">{global.totalUnitsSold || 0}</span>
          <span className="kpi-subtext">Online + Local Sales</span>
        </div>
        <div className="kpi-card highlight-gold">
          <span className="kpi-label">Potential Revenue</span>
          <span className="kpi-value">${global.potentialRevenue?.toLocaleString()}</span>
          <span className="kpi-subtext">Total Value Sold</span>
        </div>
        <div className="kpi-card highlight-blue">
          <span className="kpi-label">Inventory Value</span>
          <span className="kpi-value">${global.totalInventoryValue?.toLocaleString()}</span>
          <span className="kpi-subtext">On-hand Stock Value</span>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="charts-main-container">
        <section className="chart-box full-width">
          <h3>Monthly Revenue Trend</h3>
          <div className="chart-wrapper">
            <Line 
              data={salesTrendData}
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                resizeDelay: 200,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => '$' + value 
                    }
                  }
                },
                plugins: {
                  legend: { 
                    display: true, 
                    position: 'top',
                    labels: { usePointStyle: true } 
                  }
                }
              }} 
            />
          </div>
        </section>

        <section className="chart-box">
          <h3>Popularity by Weight</h3>
          <div className="chart-wrapper">
            <Bar 
              data={weightData}
              options={{ 
                responsive: true,
                maintainAspectRatio: false, 
                resizeDelay: 200,
                indexAxis: 'y',
                plugins: {
                  legend: { display: false }
                }
              }} 
            />
          </div>
        </section>

        <section className="chart-box">
          <h3>Top Colors Distribution</h3>
          <div className="chart-wrapper">
            <Doughnut 
              data={colorData} 
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                resizeDelay: 200,
                plugins: {
                  legend: {
                    display: !isMobile,
                    position: 'bottom',
                    labels: { 
                      boxWidth: 10, 
                      padding: 10,
                      font: { size: 11 }
                    }
                  }
                },
                cutout: '70%'
              }} 
            />
          </div>
        </section>
      </div>

      {/* FOOTER SECTION: LOCATIONS */}
      <section className="location-section">
        <h3>Pickup Location Performance</h3>
        <div className="location-grid">
          {locationPopularity.map((loc, i) => (
            <div key={i} className="loc-card">
              <span className="loc-name">{loc._id || "Unknown"}</span>
              <span className="loc-count">{loc.count} Orders</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Analytic