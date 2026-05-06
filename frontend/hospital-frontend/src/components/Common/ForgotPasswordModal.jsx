import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { X, Mail } from 'lucide-react';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/password-reset/request/', { email });
      setSent(true);
      toast.success('If the email exists, a reset link has been sent.');
    } catch (err) {
  const msg = err.response?.data?.detail || 'Failed to send reset link. Please try again.';
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
        <div className="text-center mb-4">
          <Mail className="mx-auto text-primary-600 mb-2" size={32} />
          <h2 className="text-xl font-bold">Reset Password</h2>
          <p className="text-sm text-gray-500 mt-1">Enter your email to receive a reset link.</p>
        </div>
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="text-center text-green-600">
            <p>A password reset link has been sent to your email address.</p>
            <button onClick={onClose} className="mt-4 text-primary-600 hover:underline">Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;