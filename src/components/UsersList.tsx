'use client';

import { useState, useEffect } from 'react';

interface Users {
  id: number;
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
  createdAt: string;
  updatedAt: string;
}

export default function UsersList() {
  const [items, setItems] = useState<Users[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      {items.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="p-3 border rounded-lg">
              <div className="font-semibold">id: {item.id}</div>
              <div className="font-semibold">username: {item.username}</div>
              <div className="font-semibold">email: {item.email}</div>
              <div className="font-semibold">created_at: {item.created_at}</div>
              <div className="font-semibold">updated_at: {item.updated_at}</div>
              <div className="text-sm text-gray-400">
                Created: {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}