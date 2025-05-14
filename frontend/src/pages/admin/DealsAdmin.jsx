import { useEffect, useState } from 'react';
import api from '../../services/api';

const DealsAdmin = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ discountValue: '', maxUses: '' });
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchDiscounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/discount/all');
      setDiscounts(res.data);
    } catch (err) {
      setError('Failed to fetch discounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess('');
    try {
      await api.post('/api/discount/create', {
        discountValue: Number(form.discountValue),
        maxUses: Number(form.maxUses)
      });
      setForm({ discountValue: '', maxUses: '' });
      setSuccess('Discount code created successfully!');
      fetchDiscounts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create discount');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (id, isActive) => {
    try {
      await api.put(`/api/discount/${id}/status`, { isActive: !isActive });
      fetchDiscounts();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discount code?')) return;
    try {
      await api.delete(`/api/discount/${id}`);
      fetchDiscounts();
    } catch (err) {
      setError('Failed to delete discount');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-blue-700">Discount Codes Management</h1>
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="number"
            name="discountValue"
            value={form.discountValue}
            onChange={handleInputChange}
            placeholder="Discount % (1-100)"
            min={1}
            max={100}
            required
            className="border rounded px-4 py-2 flex-1"
          />
          <input
            type="number"
            name="maxUses"
            value={form.maxUses}
            onChange={handleInputChange}
            placeholder="Max Uses (1-10)"
            min={1}
            max={10}
            required
            className="border rounded px-4 py-2 flex-1"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </form>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 py-2">Code</th>
                  <th className="px-4 py-2">Discount (%)</th>
                  <th className="px-4 py-2">Max Uses</th>
                  <th className="px-4 py-2">Current Uses</th>
                  <th className="px-4 py-2">Active</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((d) => (
                  <tr key={d._id} className="border-b">
                    <td className="px-4 py-2 font-mono font-bold text-blue-700">{d.code}</td>
                    <td className="px-4 py-2 text-center">{d.discountValue}</td>
                    <td className="px-4 py-2 text-center">{d.maxUses}</td>
                    <td className="px-4 py-2 text-center">{d.currentUses}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{d.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-4 py-2 flex gap-2 justify-center">
                      <button
                        onClick={() => handleToggleStatus(d._id, d.isActive)}
                        className={`px-3 py-1 rounded text-xs font-semibold ${d.isActive ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                      >
                        {d.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(d._id)}
                        className="px-3 py-1 rounded text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsAdmin; 