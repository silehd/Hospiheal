import { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid/index.js';
import timeGridPlugin from '@fullcalendar/timegrid/index.js';
import interactionPlugin from '@fullcalendar/interaction/index.js';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { usePermissions } from '../hooks/usePermissions';

const appointmentSchema = yup.object({
  patient: yup.number().required('Patient required'),
  doctor: yup.number().required('Doctor required'),
  appointment_date: yup.string().required('Date required'),
  appointment_time: yup.string().required('Time required'),
  reason: yup.string().required('Reason required'),
});

const Appointments = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const { can } = usePermissions();
  const canAddAppointment = can('add_appointment');
  const canViewDoctors = can('view_doctor');  // ✅ define here

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(appointmentSchema)
  });

  const fetchAppointments = useCallback(async () => {
    try {
      const { data } = await api.get('/appointments/');
      const mapped = (data.results || data).map(apt => ({
        id: apt.id,
        title: `${apt.patient_name} with Dr. ${apt.doctor_name}`,
        start: `${apt.appointment_date}T${apt.appointment_time}`,
        extendedProps: apt
      }));
      setEvents(mapped);
    } catch (error) {
      toast.error('Failed to load appointments');
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
    fetchAppointments();
    fetchPatients();
    if (canViewDoctors) {
      fetchDoctors();
    }
  }, [fetchAppointments, canViewDoctors]);

  const onSubmit = async (data) => {
    try {
      await api.post('/appointments/', data);
      toast.success('Appointment created');
      fetchAppointments();
      setShowModal(false);
      reset();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create appointment');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!can('view_appointment')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 font-semibold">Access Denied</p>
          <p className="text-gray-500">You do not have permission to view appointments.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
        {canAddAppointment && (
          <button onClick={() => setShowModal(true)} className="bg-primary-600 text-white px-4 py-2 rounded-lg">
            + New Appointment
          </button>
        )}
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          height="auto"
          editable={false}
          selectable={true}
        />
      </div>

      {showModal && canAddAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Appointment</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <select {...register('patient')} className="w-full border p-2 rounded">
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
              </select>
              {errors.patient && <p className="text-red-500 text-xs">{errors.patient.message}</p>}
              <select {...register('doctor')} className="w-full border p-2 rounded">
                <option value="">Select Doctor</option>
                {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.user?.first_name} {d.user?.last_name} - {d.specialization}</option>)}
              </select>
              {errors.doctor && <p className="text-red-500 text-xs">{errors.doctor.message}</p>}
              <input type="date" {...register('appointment_date')} className="w-full border p-2 rounded" />
              {errors.appointment_date && <p className="text-red-500 text-xs">{errors.appointment_date.message}</p>}
              <input type="time" {...register('appointment_time')} className="w-full border p-2 rounded" />
              {errors.appointment_time && <p className="text-red-500 text-xs">{errors.appointment_time.message}</p>}
              <textarea {...register('reason')} placeholder="Reason for visit" rows="3" className="w-full border p-2 rounded"></textarea>
              {errors.reason && <p className="text-red-500 text-xs">{errors.reason.message}</p>}
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

export default Appointments;