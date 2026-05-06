import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Card from '../components/Common/Card';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'medicine', quantity: 0, unit: 'pcs', unit_price: 0, reorder_level: 10 });

  const fetchItems = useCallback(async () => {
    try {
      const { data } = await api.get('/inventory/');
      setItems(data.results || data);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/inventory/${editing.id}/`, formData);
      else await api.post('/inventory/', formData);
      toast.success(editing ? 'Updated' : 'Added');
      fetchItems();
      setShowModal(false);
      setEditing(null);
      setFormData({ name: '', category: 'medicine', quantity: 0, unit: 'pcs', unit_price: 0, reorder_level: 10 });
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <button onClick={() => { setEditing(null); setFormData({}); setShowModal(true); }} className="bg-primary-600 text-white px-4 py-2 rounded-lg">+ Add Item</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <Card key={item.id}>
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.category}</p>
                <p className="text-sm">Qty: {item.quantity} {item.unit}</p>
                <p className="text-sm">Price: ${item.unit_price}</p>
                {item.quantity <= item.reorder_level && <p className="text-red-600 text-xs mt-1">⚠️ Low stock</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(item); setFormData(item); setShowModal(true); }}><Edit className="w-4 h-4 text-blue-600" /></button>
                <button onClick={async () => { if (window.confirm('Delete?')) { await api.delete(`/inventory/${item.id}/`); fetchItems(); } }}><Trash2 className="w-4 h-4 text-red-600" /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Item' : 'Add Item'}</h2>
            <form onSubmit={onSubmit} className="space-y-3">
              <input name="name" placeholder="Item name" value={formData.name} onChange={handleChange} required className="w-full border p-2 rounded" />
              <select name="category" value={formData.category} onChange={handleChange} className="w-full border p-2 rounded">
                <option value="medicine">Medicine</option>
                <option value="equipment">Equipment</option>
                <option value="supplies">Supplies</option>
              </select>
              <input name="quantity" type="number" placeholder="Quantity" value={formData.quantity} onChange={handleChange} required className="w-full border p-2 rounded" />
              <select name="unit" value={formData.unit} onChange={handleChange} className="w-full border p-2 rounded">
                <option value="pcs">Pieces</option>
                <option value="box">Box</option>
                <option value="bottle">Bottle</option>
              </select>
              <input name="unit_price" type="number" step="0.01" placeholder="Unit Price" value={formData.unit_price} onChange={handleChange} required className="w-full border p-2 rounded" />
              <input name="reorder_level" type="number" placeholder="Reorder Level" value={formData.reorder_level} onChange={handleChange} className="w-full border p-2 rounded" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;