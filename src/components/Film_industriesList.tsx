'use client';

import { useState, useEffect } from 'react';

interface Film_industries {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function Film_industriesList() {
  const [items, setItems] = useState<Film_industries[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/film_industries')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching film_industries:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading film_industries...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Film_industries</h2>
      {items.length === 0 ? (
        <p>No film_industries found.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="p-3 border rounded-lg">
              <div className="font-semibold">name: {item.name}</div>
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