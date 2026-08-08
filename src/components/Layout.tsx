import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, Map, BookOpen, Users, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  isFaculty?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, isFaculty = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark } = useTheme();
  const location = useLocation();

  const isUserFaculty = isFaculty || localStorage.getItem('facultyLoggedIn') === 'true';

  const studentMobileLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { to: '/campus-map', icon: Map, label: 'Map' },
    { to: '/classroom-finder', icon: BookOpen, label: 'Rooms' },
    { to: '/faculty-directory', icon: Users, label: 'Faculty' },
    { to: '/emergency', icon: Phone, label: 'SOS' },
  ];

  const facultyMobileLinks = [
    { to: '/faculty/dashboard', icon: LayoutDashboard, label: 'Home' },
    { to: '/campus-map', icon: Map, label: 'Map' },
    { to: '/classroom-finder', icon: BookOpen, label: 'Rooms' },
    { to: '/faculty-directory', icon: Users, label: 'Faculty' },
    { to: '/faculty/profile', icon: Phone, label: 'Profile' },
  ];

  const mobileLinks = isUserFaculty ? facultyMobileLinks : studentMobileLinks;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isFaculty={isUserFaculty} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isFaculty={isUserFaculty} />

      <main
        className={`pt-16 pb-20 md:pb-0 min-h-screen transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : ''}`}
      >
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 md:hidden border-t ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} shadow-2xl`}>
        <div className="flex items-center justify-around px-2 py-2">
          {mobileLinks.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-green-600'
                    : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-green-600' : ''} />
                <span className="text-xs font-medium">{label}</span>
                {isActive && <div className="w-1 h-1 rounded-full bg-green-600" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;