import React from 'react'
import './Dashboard.css'

const Dashboard = () => {
  return (
    <div className='dashboard'>
      <div className='dashb-left'>
        <p>Incoming Orders</p>
        <ul>
            <li></li>
        </ul>
        <p>Finished Orders</p>
        <ul>
            <li></li>
        </ul>
      </div>
      <div className='dashb-right'>
        <div className='dashb-stock'>
          <p>Missing Stock</p>
          <ul>
            <li></li>
          </ul>
          <p>Low Stock</p>
          <ul>
            <li></li>
          </ul>
        </div>
          <div className='dashb-stock'>
          <p>Best Sellers</p>
          <ul>
            <li></li>
          </ul>
          <p>Hot Sellers</p>
          <ul>
            <li></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Dashboard