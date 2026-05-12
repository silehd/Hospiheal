import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Briefcase, Phone, MapPin, Eye, EyeOff } from 'lucide-react';

const AdminRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    role: 'staff',
    phone_number: '',
    address: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    let newUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_.]/g, '');
    if (!newUsername) newUsername = email.replace(/[^a-zA-Z0-9_.]/g, '');
    setFormData(prev => ({
      ...prev,
      email,
      username: prev.username || newUsername,
    }));
    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
    if (fieldErrors.username) setFieldErrors(prev => ({ ...prev, username: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const trimmedPassword = formData.password.trim();
    const trimmedConfirm = formData.confirm_password.trim();

    if (trimmedPassword !== trimmedConfirm) {
      toast.error("Passwords don't match");
      return;
    }

    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        password: trimmedPassword,
        confirm_password: trimmedConfirm,
      };
      await api.post('/users/', submitData);
      toast.success(`User ${formData.email} created successfully!`);
      setFormData({
        username: '',
        email: '',
        password: '',
        confirm_password: '',
        first_name: '',
        last_name: '',
        role: 'staff',
        phone_number: '',
        address: '',
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Creation error:', error.response?.data);
      const errorData = error.response?.data;
      if (errorData && typeof errorData === 'object') {
        if (errorData.confirm_password) {
          toast.error(`Confirm password: ${errorData.confirm_password[0]}`);
        } else if (errorData.password) {
          toast.error(`Password: ${errorData.password[0]}`);
        } else if (errorData.username) {
          toast.error(`Username: ${errorData.username[0]}`);
        } else if (errorData.email) {
          toast.error(`Email: ${errorData.email[0]}`);
        } else if (errorData.role) {
          toast.error(`Role: ${errorData.role[0]}`);
        } else {
          const messages = Object.values(errorData).flat().join(', ');
          toast.error(messages);
        }
        setFieldErrors(errorData);
      } else {
        toast.error('User creation failed. Check console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-8 w-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-800">Create New User</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`pl-10 w-full border ${fieldErrors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 focus:ring-2 focus:ring-primary-500`}
                  placeholder="username (auto from email)"
                />
              </div>
              {fieldErrors.username && <p className="text-red-500 text-xs mt-1">{fieldErrors.username[0]}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleEmailChange}
                  className={`pl-10 w-full border ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 focus:ring-2 focus:ring-primary-500`}
                  placeholder="user@hospital.com"
                />
              </div>
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email[0]}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 pr-10 w-full border ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 focus:ring-2 focus:ring-primary-500`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password[0]}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  required
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={`pl-10 pr-10 w-full border ${fieldErrors.confirm_password ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 focus:ring-2 focus:ring-primary-500`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.confirm_password && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirm_password[0]}</p>}
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500"
                placeholder="John"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500"
                placeholder="Doe"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className={`pl-10 w-full border ${fieldErrors.role ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 focus:ring-2 focus:ring-primary-500`}
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
              </div>
              {fieldErrors.role && <p className="text-red-500 text-xs mt-1">{fieldErrors.role[0]}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={`pl-10 w-full border ${fieldErrors.phone_number ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 focus:ring-2 focus:ring-primary-500`}
                  placeholder="+1234567890"
                />
              </div>
              {fieldErrors.phone_number && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone_number[0]}</p>}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  className="pl-10 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500"
                  placeholder="Full address"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              <User className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;