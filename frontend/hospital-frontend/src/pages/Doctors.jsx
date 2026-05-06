import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Card from '../components/Common/Card';
import { usePermissions } from '../hooks/usePermissions';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    specialization: '',
    qualification: '',
    experience_years: '',
    consultation_fee: '',
    available_days: '',
    available_time_start: '09:00',
    available_time_end: '17:00'
  });

  const { can } = usePermissions();
  const canAdd = can('add_doctor');
  const canEdit = can('edit_doctor');
  const canDelete = can('delete_doctor');

  const fetchDoctors = useCallback(async () => {
    try {
      const { data } = await api.get('/doctors/');
      setDoctors(data.results || data);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/doctors/${editing.id}/`, formData);
        toast.success('Doctor updated');
      } else {
        await api.post('/doctors/', formData);
        toast.success('Doctor added');
      }
      fetchDoctors();
      setShowModal(false);
      setEditing(null);
      setFormData({ specialization: '', qualification: '', experience_years: '', consultation_fee: '', available_days: '', available_time_start: '09:00', available_time_end: '17:00' });
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const deleteDoctor = async (id) => {
    if (!canDelete) {
      toast.error("You don't have permission to delete doctors.");
      return;
    }
    if (window.confirm('Delete this doctor?')) {
      await api.delete(`/doctors/${id}/`);
      toast.success('Deleted');
      fetchDoctors();
    }
  };

  const openEditModal = (doctor) => {
    if (!canEdit) {
      toast.error("You don't have permission to edit doctors.");
      return;
    }
    setEditing(doctor);
    setFormData(doctor);
    setShowModal(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Doctors</h1>
        {canAdd && (
          <button onClick={() => { setEditing(null); setFormData({}); setShowModal(true); }} className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Doctor
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map(doc => (
          <Card key={doc.id}>
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">Dr. {doc.user?.first_name} {doc.user?.last_name}</h3>
                <p className="text-sm text-gray-500">{doc.doctor_id}</p>
                <p className="text-sm mt-1">{doc.specialization}</p>
                <p className="text-sm">{doc.qualification}</p>
                <p className="text-sm font-semibold mt-2">${doc.consultation_fee}</p>
              </div>
              <div className="flex gap-2">
                {canEdit && (
                  <button onClick={() => openEditModal(doc)}><Edit className="w-4 h-4 text-blue-600" /></button>
                )}
                {canDelete && (
                  <button onClick={() => deleteDoctor(doc.id)}><Trash2 className="w-4 h-4 text-red-600" /></button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal – same as before */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Doctor' : 'Add Doctor'}</h2>
            <form onSubmit={onSubmit} className="space-y-3">
              <input name="specialization" placeholder="Specialization" value={formData.specialization} onChange={handleChange} required className="w-full border p-2 rounded" />
              <input name="qualification" placeholder="Qualification" value={formData.qualification} onChange={handleChange} required className="w-full border p-2 rounded" />
              <input name="experience_years" type="number" placeholder="Experience (years)" value={formData.experience_years} onChange={handleChange} required className="w-full border p-2 rounded" />
              <input name="consultation_fee" type="number" step="0.01" placeholder="Consultation Fee" value={formData.consultation_fee} onChange={handleChange} required className="w-full border p-2 rounded" />
              <input name="available_days" placeholder="Available days (e.g., Mon, Tue, Wed)" value={formData.available_days} onChange={handleChange} required className="w-full border p-2 rounded" />
              <div className="flex gap-2">
                <input name="available_time_start" type="time" value={formData.available_time_start} onChange={handleChange} className="border p-2 rounded w-1/2" />
                <input name="available_time_end" type="time" value={formData.available_time_end} onChange={handleChange} className="border p-2 rounded w-1/2" />
              </div>
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

export default Doctors;