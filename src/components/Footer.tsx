import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Footer: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <footer className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'} border-t mt-auto`}>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/images/logo.png" alt="SB Jain Logo" className="h-12 w-12 object-contain" />
              <div>
                <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Campus Connect</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Smart Navigation System</p>
              </div>
            </div>
            <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Smart Indoor Navigation & Campus Management System for S.B. Jain Institute of Technology, Management & Research, Nagpur.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>System Online</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`font-semibold text-sm mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/campus-map', label: 'Campus Map' },
                { to: '/classroom-finder', label: 'Classroom Finder' },
                { to: '/faculty-directory', label: 'Faculty Directory' },
                { to: '/emergency', label: 'Emergency Contacts' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-green-600'}`}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className={`font-semibold text-sm mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Yerla Village, Kalmeshwar Road, Nagpur-441501</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-green-500 flex-shrink-0" />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>+917122667777</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-green-500 flex-shrink-0" />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>info@sbjain.edu.in</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe size={14} className="text-green-500 flex-shrink-0" />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>www.sbjain.edu.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={`border-t mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            © 2025 Campus Connect — S.B. Jain Institute of Technology, Management & Research
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            An Autonomous Institute | Affiliated to R.T.M. Nagpur University
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
