import React from 'react'
import './Dashboard.css'

import {
  incomingOrders,
  finishedOrders,
  missingStock,
  lowStock,
  bestSellers,
  hotSellers,
} from "../../Assets/Sample_Data";


const Dashboard = () => {
  return (
    <div className='dashboard'>
      <div className='dashb-left'>
        <p>Incoming Orders</p>
        <ul>
          {incomingOrders.map((order, i) => (
            <li key={i}>
              <strong>{order.name}</strong>
              <div>{order.email}</div>
              {order.items.map((item, idx) => (
                <div key={idx}>
                  {item.jigId} – {item.quantity}x – ${item.price} – {item.color}
                </div>
              ))}
            </li>
          ))}
        </ul>

        <p>Finished Orders</p>
        <ul>
          {finishedOrders.map((order, i) => (
            <li key={i}>
              <strong>{order.name}</strong>
              <div>{order.email}</div>
              {order.items.map((item, idx) => (
                <div key={idx}>
                  {item.jigId} – {item.quantity}x – ${item.price} – {item.color}
                </div>
              ))}
            </li>
          ))}
        </ul>
      </div>

      <div className='dashb-right'>
        <div className='dashb-stock'>
          <div>
            <p>Missing Stock</p>
            <ul>
              {missingStock.map((item, i) => (
                <li key={i}>
                  {item.jigId} – {item.status}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p>Low Stock</p>
            <ul>
              {lowStock.map((item, i) => (
                <li key={i}>
                  {item.jigId} – {item.remaining} left
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className='dashb-stock'>
          <div>
            <p>Best Sellers</p>
            <ul>
              {bestSellers.map((jig, i) => (
                <li key={i}>{jig}</li>
              ))}
            </ul>
          </div>

          <div>
            <p>Hot Sellers</p>
            <ul>
              {hotSellers.map((jig, i) => (
                <li key={i}>{jig}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard