import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const rolePermissions = {
  admin: [
    'view_patient', 'add_patient', 'edit_patient', 'delete_patient',
    'view_doctor', 'add_doctor', 'edit_doctor', 'delete_doctor',
    'view_appointment', 'add_appointment', 'edit_appointment', 'delete_appointment',
    'view_billing', 'add_billing', 'edit_billing', 'delete_billing',
    'view_inventory', 'add_inventory', 'edit_inventory', 'delete_inventory',
    'view_labtest', 'add_labtest', 'edit_labtest', 'delete_labtest',
    'view_medical_record', 'add_medical_record', 'edit_medical_record',
    'view_prescription', 'add_prescription', 'edit_prescription',
    'add_user', 'manage_users',
  ],
  doctor: [
    'view_patient', 'edit_patient',
    'view_doctor',
    'view_appointment', 'add_appointment', 'edit_appointment',
    'view_medical_record', 'add_medical_record', 'edit_medical_record',
    'view_prescription', 'add_prescription',
    'view_labtest', 'add_labtest',
  ],
  receptionist: [
    'view_patient', 'add_patient',
    'view_appointment', 'add_appointment',
    'view_doctor',
  ],
  lab_technician: [
    'view_labtest', 'edit_labtest',
  ],
  pharmacist: [
    'view_prescription', 'edit_prescription',
  ],
  accountant: [
    'view_billing', 'add_billing', 'edit_billing',
  ],
  nurse: [
    'view_patient',
    'view_medical_record',
  ],
};

export const usePermissions = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role || '';

  const can = (action) => {
    if (role === 'admin') return true;
    return rolePermissions[role]?.includes(action) || false;
  };

  return { can, role };
};