import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useForm } from 'react-hook-form';
import { usePermissions } from '../hooks/usePermissions';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const { can } = usePermissions();
  const canAddBill = can('add_billing');
  const canViewBill = can('view_billing');

  const { register, handleSubmit, reset } = useForm();

  // Corrected function name: fetchBills
  const fetchBills = useCallback(async () => {
    try {
      const { data } = await api.get('/bills/');
      setBills(data.results || data);
    } catch (error) {
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPatients = useCallback(async () => {
    try {
      const { data } = await api.get('/patients/');
      setPatients(data.results || data);
    } catch (error) {
      toast.error('Failed to load patients');
    }
  }, []);

  useEffect(() => {
    if (canViewBill) {
      fetchBills();
      fetchPatients();
    } else {
      setLoading(false);
    }
  }, [canViewBill, fetchBills, fetchPatients]);

  const onSubmit = async (formData) => {
    try {
      await api.post('/bills/', formData);
      toast.success('Invoice created');
      fetchBills();
      setShowModal(false);
      reset();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create bill');
    }
  };

  if (!canViewBill) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 font-semibold">Access Denied</p>
          <p className="text-gray-500">You do not have permission to view billing.</p>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Billing</h1>
        {canAddBill && (
          <button onClick={() => setShowModal(true)} className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Invoice
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {bills.map(bill => (
              <tr key={bill.id} className="border-b">
                <td className="px-6 py-4">{bill.invoice_id}</td>
                <td className="px-6 py-4">{bill.patient_name}</td>
                <td className="px-6 py-4">${bill.total_amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    bill.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>{bill.payment_status}</span>
                </td>
                <td className="px-6 py-4">{bill.due_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && canAddBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Invoice</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <select {...register('patient')} required className="w-full border p-2 rounded">
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
              </select>
              <input {...register('description')} placeholder="Description" required className="w-full border p-2 rounded" />
              <input {...register('amount')} type="number" step="0.01" placeholder="Amount" required className="w-full border p-2 rounded" />
              <input {...register('due_date')} type="date" required className="w-full border p-2 rounded" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;