import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Plus, Edit, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Card from '../components/Common/Card';
import { usePermissions } from '../hooks/usePermissions';

const LabTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const { can } = usePermissions();
  const canAddTest = can('add_labtest');
  const canEditTest = can('edit_labtest');
  const canViewTest = can('view_labtest');

  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    test_name: '',
    test_category: '',
    instructions: ''
  });

  const fetchTests = useCallback(async () => {
    try {
      const { data } = await api.get('/lab-tests/');
      setTests(data.results || data);
    } catch (error) {
      toast.error('Failed to load lab tests');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPatients = async () => {
    const { data } = await api.get('/patients/');
    setPatients(data.results || data);
  };

  const fetchDoctors = async () => {
    const { data } = await api.get('/doctors/');
    setDoctors(data.results || data);
  };

  useEffect(() => {
    if (canViewTest) {
      fetchTests();
      fetchPatients();
      fetchDoctors();
    } else {
      setLoading(false);
    }
  }, [canViewTest, fetchTests]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/lab-tests/', formData);
      toast.success('Lab test ordered');
      fetchTests();
      setShowModal(false);
      setFormData({ patient: '', doctor: '', test_name: '', test_category: '', instructions: '' });
    } catch (error) {
      toast.error('Failed to order test');
    }
  };

  const updateResult = async (testId, result, result_status) => {
    try {
      await api.patch(`/lab-tests/${testId}/update-result/`, { result, result_status });
      toast.success('Result updated');
      fetchTests();
      setShowResultModal(false);
      setSelectedTest(null);
    } catch (error) {
      toast.error('Failed to update result');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!canViewTest) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 font-semibold">Access Denied</p>
          <p className="text-gray-500">You do not have permission to view lab tests.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lab Tests</h1>
        {canAddTest && (
          <button onClick={() => setShowModal(true)} className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> Order Test
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map(test => (
          <Card key={test.id}>
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{test.test_name}</h3>
                <p className="text-sm text-gray-500">{test.test_id}</p>
                <p className="text-sm mt-1">Patient: {test.patient_name}</p>
                <p className="text-sm">Doctor: {test.doctor_name}</p>
                <p className="text-sm mt-2">
                  Status: 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    test.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    test.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                  }`}>{test.status}</span>
                </p>
              </div>
              {canEditTest && test.status !== 'completed' && (
                <button onClick={() => { setSelectedTest(test); setShowResultModal(true); }} className="text-primary-600">
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {test.status === 'completed' && test.result && (
                <button onClick={() => alert(test.result)} className="text-green-600">
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Order Test Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Order Lab Test</h2>
            <form onSubmit={onSubmit} className="space-y-3">
              <select name="patient" value={formData.patient} onChange={handleChange} required className="w-full border p-2 rounded">
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
              </select>
              <select name="doctor" value={formData.doctor} onChange={handleChange} required className="w-full border p-2 rounded">
                <option value="">Select Doctor</option>
                {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.user?.first_name} {d.user?.last_name}</option>)}
              </select>
              <input name="test_name" placeholder="Test Name" value={formData.test_name} onChange={handleChange} required className="w-full border p-2 rounded" />
              <input name="test_category" placeholder="Category (e.g., Blood, Urine)" value={formData.test_category} onChange={handleChange} required className="w-full border p-2 rounded" />
              <textarea name="instructions" placeholder="Instructions" value={formData.instructions} onChange={handleChange} rows="3" className="w-full border p-2 rounded"></textarea>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Result Modal */}
      {showResultModal && selectedTest && canEditTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Update Test Result</h2>
            <p className="text-sm text-gray-600 mb-2">{selectedTest.test_name} for {selectedTest.patient_name}</p>
            <textarea
              id="result"
              placeholder="Enter test results..."
              rows="5"
              className="w-full border p-2 rounded mb-3"
            />
            <select id="result_status" className="w-full border p-2 rounded mb-3">
              <option value="normal">Normal</option>
              <option value="abnormal">Abnormal</option>
              <option value="critical">Critical</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowResultModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={() => {
                const result = document.getElementById('result').value;
                const result_status = document.getElementById('result_status').value;
                if (result) updateResult(selectedTest.id, result, result_status);
                else toast.error('Please enter a result');
              }} className="px-4 py-2 bg-primary-600 text-white rounded">Save Result</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabTests;
