import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { X, Eye, EyeOff } from 'lucide-react';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    setLoading(true);
    try {
      await api.post('/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_new_password: confirmPassword,
      });
      toast.success('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (error) {
      const errorData = error.response?.data;
      let msg = 'Failed to change password';
      if (errorData) {
        if (errorData.old_password) msg = errorData.old_password[0];
        else if (errorData.detail) msg = errorData.detail;
        else if (errorData.confirm_new_password) msg = errorData.confirm_new_password[0];
        else msg = JSON.stringify(errorData);
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-4">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Old Password */}
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              placeholder="Current Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-2 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-2 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm New Password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-2 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;