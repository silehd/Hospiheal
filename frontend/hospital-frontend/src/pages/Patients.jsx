import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Card from '../components/Common/Card';
import { usePermissions } from '../hooks/usePermissions';

const dateFormatRegex = /^\d{4}\/\d{2}\/\d{2}$/;

const patientSchema = yup.object({
  first_name: yup.string().required('First name required'),
  last_name: yup.string().required('Last name required'),
  email: yup.string().email('Invalid email').required('Email required'),
  phone_number: yup.string().required('Phone required'),
  date_of_birth: yup.string()
    .required('Date of birth required')
    .matches(dateFormatRegex, 'Date must be in format yyyy/mm/dd'),
  gender: yup.string().required('Gender required'),
  address: yup.string().required('Address required'),
  emergency_contact_name: yup.string().required('Emergency contact required'),
  emergency_contact_phone: yup.string().required('Emergency phone required'),
  blood_type: yup.string(),
});

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { can } = usePermissions();
  const canAddPatient = can('add_patient');
  const canEditPatient = can('edit_patient');
  const canDeletePatient = can('delete_patient');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(patientSchema)
  });

  const fetchPatients = useCallback(async () => {
    try {
      const { data } = await api.get('/patients/');
      const patientsData = data.results || data;
      const formatted = patientsData.map(p => ({
        ...p,
        date_of_birth: p.date_of_birth ? p.date_of_birth.replace(/-/g, '/') : ''
      }));
      setPatients(formatted);
    } catch (error) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const convertToBackendDate = (dateStr) => dateStr.replace(/\//g, '-');

  const onSubmit = async (data) => {
    const submissionData = { ...data, date_of_birth: convertToBackendDate(data.date_of_birth) };
    try {
      if (editingPatient) {
        await api.put(`/patients/${editingPatient.id}/`, submissionData);
        toast.success('Patient updated');
      } else {
        await api.post('/patients/', submissionData);
        toast.success('Patient added');
      }
      fetchPatients();
      setShowModal(false);
      reset();
      setEditingPatient(null);
    } catch (error) {
      const msg = error.response?.data?.detail || 'Operation failed';
      toast.error(msg);
    }
  };

  const deletePatient = async (id) => {
    if (window.confirm('Delete this patient?')) {
      try {
        await api.delete(`/patients/${id}/`);
        toast.success('Deleted');
        fetchPatients();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const openEditModal = (patient) => {
    if (!canEditPatient) {
      toast.error("You don't have permission to edit patients.");
      return;
    }
    setEditingPatient(patient);
    const formatted = { ...patient, date_of_birth: patient.date_of_birth?.replace(/-/g, '/') || '' };
    reset(formatted);
    setShowModal(true);
  };

  const filteredPatients = patients.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patient_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
        {canAddPatient && (
          <button
            onClick={() => { setEditingPatient(null); reset({}); setShowModal(true); }}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" /> Add Patient
          </button>
        )}
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by name or ID..."
          className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-96"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card key={patient.id}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{patient.first_name} {patient.last_name}</h3>
                <p className="text-sm text-gray-500">{patient.patient_id}</p>
                <p className="text-sm mt-2">{patient.email}</p>
                <p className="text-sm">{patient.phone_number}</p>
                <p className="text-sm text-gray-500">DOB: {patient.date_of_birth}</p>
              </div>
              <div className="flex gap-2">
                {canEditPatient && (
                  <button onClick={() => openEditModal(patient)} className="text-blue-600 hover:text-blue-800">
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {canDeletePatient && (
                  <button onClick={() => deletePatient(patient.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingPatient ? 'Edit Patient' : 'Add Patient'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* same input fields as before – omitted for brevity, copy from previous patient form */}
                <div>
                  <label className="block text-sm font-medium">First Name *</label>
                  <input {...register('first_name')} className="mt-1 block w-full border rounded-md p-2" />
                  {errors.first_name && <p className="text-red-500 text-xs">{errors.first_name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">Last Name *</label>
                  <input {...register('last_name')} className="mt-1 block w-full border rounded-md p-2" />
                  {errors.last_name && <p className="text-red-500 text-xs">{errors.last_name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">Email *</label>
                  <input type="email" {...register('email')} className="mt-1 block w-full border rounded-md p-2" />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">Phone *</label>
                  <input {...register('phone_number')} className="mt-1 block w-full border rounded-md p-2" />
                  {errors.phone_number && <p className="text-red-500 text-xs">{errors.phone_number.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">Date of Birth * (yyyy/mm/dd)</label>
                  <input type="text" placeholder="yyyy/mm/dd" {...register('date_of_birth')} className="mt-1 block w-full border rounded-md p-2" />
                  {errors.date_of_birth && <p className="text-red-500 text-xs">{errors.date_of_birth.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">Gender *</label>
                  <select {...register('gender')} className="mt-1 block w-full border rounded-md p-2">
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Blood Type</label>
                  <input {...register('blood_type')} className="mt-1 block w-full border rounded-md p-2" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium">Address *</label>
                  <textarea {...register('address')} rows="2" className="mt-1 block w-full border rounded-md p-2"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium">Emergency Contact *</label>
                  <input {...register('emergency_contact_name')} className="mt-1 block w-full border rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Emergency Phone *</label>
                  <input {...register('emergency_contact_phone')} className="mt-1 block w-full border rounded-md p-2" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;