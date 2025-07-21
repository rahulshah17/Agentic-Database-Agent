'use client';
import { useState, useEffect } from 'react';

interface Songs {
  id: number;
  title: string;
  album: string;
  createdAt: string;
  updatedAt: string;
}

export default function SongsList() {
  const [items, setItems] = useState<Songs[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState({ title: '', album: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: '', album: '' });
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/songs`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError('Failed to fetch songs');
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
      const res = await fetch(`/api/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to add songs');
      setForm({ title: '', album: '' });
      fetchItems();
    } catch (err) {
      setError('Failed to add songs');
    }
  };

  const handleEdit = (item: Songs) => {
    setEditingId(item.id);
    setEditForm({ title: item.title, album: item.album });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`/api/songs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...editForm }),
      });
      if (!res.ok) throw new Error('Failed to update songs');
      setEditingId(null);
      fetchItems();
    } catch (err) {
      setError('Failed to update songs');
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/songs?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete songs');
      fetchItems();
    } catch (err) {
      setError('Failed to delete songs');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Songs Management</h2>
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
        <div>Loading songs...</div>
      ) : items.length === 0 ? (
        <p>No songs found.</p>
      ) : (
        <div className="space-y-2 mb-6">
          {items.map((item) => (
            <div key={item.id} className="p-3 border rounded-lg flex justify-between items-center">
              {editingId === item.id ? (
                <form onSubmit={handleEditSubmit} className="flex gap-2 flex-1">
                  <input name="title" value={editForm.title} onChange={handleEditInputChange} className="border rounded px-2 py-1 flex-1" placeholder="Title" required />
                  <input name="album" value={editForm.album} onChange={handleEditInputChange} className="border rounded px-2 py-1 flex-1" placeholder="Album" required />
                  <button type="submit" className="px-2 py-1 bg-green-600 text-white rounded">Save</button>
                  <button type="button" className="px-2 py-1 bg-gray-400 text-white rounded" onClick={() => setEditingId(null)}>Cancel</button>
                </form>
              ) : (
                <>
                  <div>
                    <div className="font-semibold">{item.title}</div>
                    <div className="font-semibold">{item.album}</div>
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
        <input name="title" value={form.title} onChange={handleInputChange} className="border rounded px-2 py-1 flex-1" placeholder="Title" required />
        <input name="album" value={form.album} onChange={handleInputChange} className="border rounded px-2 py-1 flex-1" placeholder="Album" required />
        <button type="submit" className="px-4 py-1 bg-green-600 text-white rounded">Add</button>
      </form>
    </div>
  );
}
