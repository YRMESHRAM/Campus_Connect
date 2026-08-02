import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Map, BookOpen, Users, Phone, MessageSquare,
  User, Settings, LogOut, X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isFaculty?: boolean;
}

const studentLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/campus-map', icon: Map, label: 'Campus Map' },
  { to: '/classroom-finder', icon: BookOpen, label: 'Classroom Finder' },
  { to: '/faculty-directory', icon: Users, label: 'Faculty Directory' },
  { to: '/emergency', icon: Phone, label: 'Emergency' },
  { to: '/feedback', icon: MessageSquare, label: 'Feedback' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const facultyLinks = [
  { to: '/faculty/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/campus-map', icon: Map, label: 'Campus Map' },
  { to: '/classroom-finder', icon: BookOpen, label: 'Classroom Finder' },
  { to: '/faculty-directory', icon: Users, label: 'Faculty Directory' },
  { to: '/emergency', icon: Phone, label: 'Emergency' },
  { to: '/faculty/profile', icon: User, label: 'My Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isFaculty = false }) => {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const links = isFaculty ? facultyLinks : studentLinks;

  const handleLogout = () => {
    localStorage.removeItem('facultyLoggedIn');
    localStorage.removeItem('studentLoggedIn');
    navigate('/');
    onClose();
  };

  const sidebarContent = (
    <div className={`flex flex-col h-full ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          <div>
            <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Campus Connect</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>S.B. Jain Institute</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
        >
          <X size={18} />
        </button>
      </div>


      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {links.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`sidebar-link ${isActive ? 'active' : isDark ? 'text-gray-300 hover:text-green-400' : 'text-gray-600'}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className={`p-3 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full text-red-500 ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-16 bottom-0 w-64 z-40 shadow-xl hidden md:block overflow-hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 shadow-2xl md:hidden overflow-hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
