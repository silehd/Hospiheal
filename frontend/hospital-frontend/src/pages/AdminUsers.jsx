import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Edit, KeyRound, Shield, UserX } from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Card from '../components/Common/Card';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/users/');
      setUsers(data.results || data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRoleValue) => {
    try {
      await api.patch(`/users/${userId}/`, { role: newRoleValue });
      toast.success('Role updated');
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Delete user "${userName}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/users/${userId}/`);
        toast.success('User deleted');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleResetPassword = async (userId) => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await api.post(`/users/${userId}/reset-password/`, { new_password: newPassword });
      toast.success('Password reset successfully');
      setShowResetModal(false);
      setResetPasswordUser(null);
      setNewPassword('');
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <button
            onClick={() => window.location.href = '/admin/register'}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <Shield className="w-4 h-4" /> Add New User
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.first_name} {user.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {editingUser === user.id ? (
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="border rounded p-1 text-sm"
                      >
                        <option value="admin">Admin</option>
                        <option value="doctor">Doctor</option>
                        <option value="nurse">Nurse</option>
                        <option value="receptionist">Receptionist</option>
                        <option value="lab_technician">Lab Technician</option>
                        <option value="pharmacist">Pharmacist</option>
                        <option value="accountant">Accountant</option>
                        <option value="staff">Staff</option>
                      </select>
                    ) : (
                      <span className="capitalize">{user.role}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {editingUser === user.id ? (
                        <>
                          <button
                            onClick={() => handleRoleChange(user.id, newRole)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditingUser(user.id); setNewRole(user.role); }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Role"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setResetPasswordUser(user); setShowResetModal(true); }}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Reset Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.email)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete User"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && resetPasswordUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reset Password for {resetPasswordUser.email}</h2>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowResetModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={() => handleResetPassword(resetPasswordUser.id)} className="px-4 py-2 bg-primary-600 text-white rounded">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;