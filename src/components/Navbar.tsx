import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Menu, Sun, Moon, User, LogOut, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import notifications from '../data/notifications.json';

interface NavbarProps {
  onMenuClick?: () => void;
  isFaculty?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, isFaculty = false }) => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const searchSuggestions = [
    'Room 101', 'Computer Lab 1', 'Electronics Lab', 'Seminar Hall',
    'Dr. Rajesh Sharma', 'Prof. Sunita Verma', 'CSE Department',
  ].filter((s) => searchQuery && s.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleLogout = () => {
    localStorage.removeItem('facultyLoggedIn');
    localStorage.removeItem('studentLoggedIn');
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 nav-blur border-b ${isDark ? 'border-gray-800 bg-gray-900/95' : 'border-gray-100'} shadow-sm`}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left */}
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <Menu size={20} />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <img src="/images/logo.png" alt="SB Jain Logo" className="h-10 w-10 object-contain" />
            <div className="hidden sm:block">
              <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Campus Connect</span>
              <p className={`text-xs leading-tight ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>S.B. Jain Institute</p>
            </div>
          </Link>
        </div>

        {/* Center Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <div className={`flex items-center gap-2 w-full px-4 py-2 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}>
            <Search size={16} className={isDark ? 'text-gray-400' : 'text-gray-400'} />
            <input
              type="text"
              placeholder="Search rooms, faculty, labs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
            />
          </div>
          <AnimatePresence>
            {searchSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`absolute top-full mt-2 w-full rounded-xl shadow-xl border overflow-hidden z-50 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
              >
                {searchSuggestions.map((s, i) => (
                  <button
                    key={i}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}
                    onClick={() => {
                      navigate('/search?q=' + encodeURIComponent(s));
                      setSearchQuery('');
                    }}
                  >
                    <Search size={12} className="inline mr-2 opacity-50" />
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Mobile Search */}
          <button
            className={`md:hidden p-2 rounded-xl transition-all ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search size={18} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-gray-800 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
              className={`p-2 rounded-xl transition-all relative ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border overflow-hidden z-50 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                >
                  <div className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{unreadCount} new</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto scrollbar-thin">
                    {notifications.map((n) => (
                      <div key={n.id} className={`px-4 py-3 border-b transition-colors cursor-pointer ${!n.read ? (isDark ? 'bg-green-900/20' : 'bg-green-50/50') : ''} ${isDark ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-50 hover:bg-gray-50'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-green-500' : (isDark ? 'bg-gray-600' : 'bg-gray-200')}`} />
                          <div>
                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{n.title}</p>
                            <p className={`text-xs mt-0.5 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{n.message}</p>
                            <p className="text-xs text-green-600 mt-1">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3">
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifications(false)}
                      className="text-sm text-green-600 font-medium hover:text-green-700"
                    >
                      View all notifications →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className={`flex items-center gap-2 p-1.5 rounded-xl transition-all ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
            </button>
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className={`absolute right-0 mt-2 w-52 rounded-2xl shadow-2xl border overflow-hidden z-50 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                >
                  <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{isFaculty ? 'Faculty Portal' : 'Student'}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>S.B. Jain Institute</p>
                  </div>
                  <div className="p-2">
                    <Link to={isFaculty ? '/faculty/profile' : '/profile'} onClick={() => setShowProfile(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}>
                      <User size={16} /> Profile
                    </Link>
                    <Link to="/settings" onClick={() => setShowProfile(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}>
                      <Settings size={16} /> Settings
                    </Link>
                    <button onClick={handleLogout}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors text-red-500 ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`px-4 pb-3 md:hidden`}
          >
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search rooms, faculty, labs..."
                className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700'}`}
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
