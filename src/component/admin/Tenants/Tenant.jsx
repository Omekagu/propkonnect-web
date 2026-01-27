import React from 'react'
import './Tenant.scss'

export default function Tenant ({ title = 'Tenants' }) {
  const mockData = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 234 567 890',
      location: 'Texas, USA',
      status: 'Active'
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1 987 654 321',
      location: 'Oregon, USA',
      status: 'Pending'
    }
  ]

  return (
    <div>
      <div className='user-section'>
        <div className='section-header'>
          <h2>{title} Overview</h2>
          <button className='add-btn'>+ Add {title}</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((user, i) => (
              <tr key={i}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.location}</td>
                <td>
                  <span
                    className={`status ${
                      user.status === 'Active' ? 'active' : 'pending'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td>
                  <button className='btn-view'>View</button>
                  <button className='btn-edit'>Edit</button>
                  <button className='btn-delete'>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
