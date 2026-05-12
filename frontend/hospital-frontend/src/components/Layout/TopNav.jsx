import { useState } from 'react';
import { Menu, Bell, User, KeyRound } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ChangePasswordModal from '../Common/ChangePasswordModal';

const TopNav = ({ toggleMobileSidebar, toggleDesktopSidebar }) => {
  const { user } = useContext(AuthContext);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          <button onClick={toggleMobileSidebar} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <button onClick={toggleDesktopSidebar} className="hidden lg:block p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 hidden sm:block">
            Welcome back, {user?.first_name || user?.username}
          </h2>
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-gray-100 relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user?.first_name || user?.username}
              </span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    setShowPasswordModal(true);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                >
                  <KeyRound className="inline w-4 h-4 mr-2" /> Change Password
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </>
  );
};

export default TopNav;