'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './myproperties.scss'

export default function MyProperties () {
  const [history, setHistory] = useState([])
  const userId = localStorage.getItem('userId')

  useEffect(() => {
    if (!userId) return
    axios
      .get(`http://localhost:5000/api/properties/history/${userId}`)
      .then(res => setHistory(res.data))
      .catch(err => console.error(err))
  }, [userId])

  return (
    <div className='my-properties'>
      <h1>My Property History</h1>

      {history.length === 0 ? (
        <p className='empty'>
          You haven’t applied or paid for any properties yet.
        </p>
      ) : (
        <div className='history-grid'>
          {history.map(item => (
            <div className='history-card' key={item._id}>
              <div className='header'>
                <h3>{item.propertyTitle}</h3>
                <span className={`status ${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>
              <div className='details'>
                <p>
                  <strong>Type:</strong> {item.category}
                </p>
                <p>
                  <strong>Plan:</strong> {item.paymentPlan}
                </p>
                <p>
                  <strong>Amount Paid:</strong> ₦
                  {item.amountPaid?.toLocaleString()}
                </p>
                <p>
                  <strong>Date:</strong>{' '}
                  {new Date(item.dateApplied).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
