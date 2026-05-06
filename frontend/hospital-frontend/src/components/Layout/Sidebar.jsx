import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Stethoscope, Calendar, 
  Receipt, Package, FlaskConical, LogOut, ChevronLeft, X, UserPlusIcon, Shield
} from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';

const Sidebar = ({ isOpen, setIsOpen, isMobileOpen, setIsMobileOpen }) => {
  const { logout } = useContext(AuthContext);
  const { can } = usePermissions();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: null },
    { path: '/patients', label: 'Patients', icon: Users, permission: 'view_patient' },
    { path: '/doctors', label: 'Doctors', icon: Stethoscope, permission: 'view_doctor' },
    { path: '/appointments', label: 'Appointments', icon: Calendar, permission: 'view_appointment' },
    { path: '/billing', label: 'Billing', icon: Receipt, permission: 'view_billing' },
    { path: '/inventory', label: 'Inventory', icon: Package, permission: 'view_inventory' },
    { path: '/lab-tests', label: 'Lab Tests', icon: FlaskConical, permission: 'view_labtest' },
    { path: '/admin/register', label: 'Add User', icon: UserPlusIcon, permission: 'add_user' },
    { path: '/admin/users', label: 'Manage Users', icon: Shield, permission: 'add_user' }, // or create a 'manage_users' permission
  ];

  // Filter nav items based on permissions
  const visibleNavItems = navItems.filter(item => !item.permission || can(item.permission));

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between p-4 border-b">
        <div className={`flex items-center space-x-2 ${!isOpen && 'justify-center w-full'}`}>
          <div className="h-10 w-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          {isOpen && (
            <div className="leading-tight">
              <div className="text-sm font-bold text-primary-600">HOSPHEAL SPECIALIST</div>
              <div className="text-xs text-gray-500">PHARMACY LTD</div>
              <div className="text-[10px] text-gray-400 italic">Prescribing Health, Dispensing Care</div>
            </div>
          )}
        </div>
        {isOpen && (
          <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 hidden lg:block">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      <nav className="flex-1 py-4">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileOpen?.(false)}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-100'
              } ${!isOpen && 'justify-center'}`
            }
          >
            <item.icon className="w-5 h-5" />
            {isOpen && <span className="ml-3">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={logout}
          className={`flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors ${
            !isOpen && 'justify-center'
          }`}
        >
          <LogOut className="w-5 h-5" />
          {isOpen && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-white shadow-lg h-screen sticky top-0 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 lg:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-end p-2">
          <button onClick={() => setIsMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="flex flex-col h-full">{sidebarContent}</div>
      </aside>
    </>
  );
};

export default Sidebar;