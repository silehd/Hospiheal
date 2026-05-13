import { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Briefcase, Phone, MapPin, Eye, EyeOff } from 'lucide-react';

const Register = () => {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedPassword = formData.password.trim();
    const trimmedConfirm = formData.confirm_password.trim();
    if (trimmedPassword !== trimmedConfirm) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      // Send all fields, including confirm_password
      await api.post('/register/', {
        ...formData,
        password: trimmedPassword,
        confirm_password: trimmedConfirm,
      });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      const errorData = error.response?.data;
      if (errorData && typeof errorData === 'object') {
        const messages = Object.values(errorData).flat().join(', ');
        toast.error(messages);
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">Create an account</h2>
        <p className="text-center text-sm text-gray-500 mb-6">Join Hospiheal Medical Centre</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Username *</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input name="username" required value={formData.username} onChange={handleChange} className="pl-10 w-full border rounded-lg p-2" placeholder="johndoe" />
            </div>
          </div>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="pl-10 w-full border rounded-lg p-2" placeholder="user@hospital.com" />
            </div>
          </div>
          {/* Password with toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Password *</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-10 w-full border rounded-lg p-2"
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
          </div>
          {/* Confirm Password with toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password *</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                className="pl-10 pr-10 w-full border rounded-lg p-2"
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
          </div>
          {/* First/Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input name="first_name" value={formData.first_name} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2" placeholder="John" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input name="last_name" value={formData.last_name} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2" placeholder="Doe" />
            </div>
          </div>
          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Role *</label>
            <div className="relative mt-1">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select name="role" required value={formData.role} onChange={handleChange} className="pl-10 w-full border rounded-lg p-2">
                <option value="staff">Staff</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="receptionist">Receptionist</option>
                <option value="lab_technician">Lab Technician</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="accountant">Accountant</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input name="phone_number" value={formData.phone_number} onChange={handleChange} className="pl-10 w-full border rounded-lg p-2" placeholder="+1234567890" />
            </div>
          </div>
          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="pl-10 w-full border rounded-lg p-2" placeholder="Full address"></textarea>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#007684] text-white py-2 rounded-lg font-semibold hover:bg-[#005f6a] disabled:opacity-50">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
          <div className="text-center">
            <Link to="/login" className="text-sm text-[#007684] hover:underline">Already have an account? Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;