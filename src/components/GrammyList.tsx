'use client';
import { useState, useEffect } from 'react';

interface Grammy {
  id: number;
  song_title: string;
  createdAt: string;
  updatedAt: string;
}

export default function GrammyList() {
  const [items, setItems] = useState<Grammy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState({ song_title: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ song_title: '' });
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/grammy`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError('Failed to fetch grammy');
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`/api/grammy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to add grammy');
      setForm({ song_title: '' });
      fetchItems();
    } catch (err) {
      setError('Failed to add grammy');
    }
  };

  const handleEdit = (item: Grammy) => {
    setEditingId(item.id);
    setEditForm({ song_title: item.song_title });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`/api/grammy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...editForm }),
      });
      if (!res.ok) throw new Error('Failed to update grammy');
      setEditingId(null);
      fetchItems();
    } catch (err) {
      setError('Failed to update grammy');
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/grammy?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete grammy');
      fetchItems();
    } catch (err) {
      setError('Failed to delete grammy');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Grammy Management</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="flex items-center mb-4">
        <button
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold mr-2"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
        <span className="text-gray-400 text-sm">{items.length} items</span>
      </div>
      {loading ? (
        <div>Loading grammy...</div>
      ) : items.length === 0 ? (
        <p>No grammy found.</p>
      ) : (
        <div className="space-y-2 mb-6">
          {items.map((item) => (
            <div key={item.id} className="p-3 border rounded-lg flex justify-between items-center">
              {editingId === item.id ? (
                <form onSubmit={handleEditSubmit} className="flex gap-2 flex-1">
                  <input name="song_title" value={editForm.song_title} onChange={handleEditInputChange} className="border rounded px-2 py-1 flex-1" placeholder="Song_title" required />
                  <button type="submit" className="px-2 py-1 bg-green-600 text-white rounded">Save</button>
                  <button type="button" className="px-2 py-1 bg-gray-400 text-white rounded" onClick={() => setEditingId(null)}>Cancel</button>
                </form>
              ) : (
                <>
                  <div>
                    <div className="font-semibold">{item.song_title}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-2 py-1 bg-yellow-500 text-white rounded" onClick={() => handleEdit(item)}>Edit</button>
                    <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => handleDelete(item.id)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      <hr className="my-6" />
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input name="song_title" value={form.song_title} onChange={handleInputChange} className="border rounded px-2 py-1 flex-1" placeholder="Song_title" required />
        <button type="submit" className="px-4 py-1 bg-green-600 text-white rounded">Add</button>
      </form>
    </div>
  );
}
