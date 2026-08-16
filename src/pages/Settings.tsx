import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Bell, Shield, Info, LogOut, Save, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: false,
    language: 'English',
    privacy: true,
    autoLocation: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('campusSettings');
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  const handleSave = () => {
    localStorage.setItem('campusSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-green-600' : isDark ? 'bg-gray-600' : 'bg-gray-300'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${value ? 'left-7' : 'left-1'}`} />
    </button>
  );

  const sections = [
    {
      title: 'Appearance',
      icon: isDark ? Moon : Sun,
      items: [
        {
          label: 'Dark Mode',
          desc: 'Switch between light and dark theme',
          control: <Toggle value={isDark} onChange={toggleTheme} />,
        },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          label: 'Push Notifications',
          desc: 'Receive campus announcements and alerts',
          control: <Toggle value={settings.notifications} onChange={() => setSettings({ ...settings, notifications: !settings.notifications })} />,
        },
        {
          label: 'Email Notifications',
          desc: 'Get updates in your inbox',
          control: <Toggle value={settings.emailNotifications} onChange={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })} />,
        },
      ],
    },
    
    {
      title: 'Privacy & Security',
      icon: Shield,
      items: [
        {
          label: 'Share Location',
          desc: 'Allow app to use your location for better navigation',
          control: <Toggle value={settings.autoLocation} onChange={() => setSettings({ ...settings, autoLocation: !settings.autoLocation })} />,
        },
        {
          label: 'Analytics',
          desc: 'Help improve the app with usage data',
          control: <Toggle value={settings.privacy} onChange={() => setSettings({ ...settings, privacy: !settings.privacy })} />,
        },
      ],
    },
  ];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Customize your Campus Connect experience</p>
        </motion.div>

        <div className="space-y-4">
          {sections.map(({ title, icon: Icon, items }, si) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.1 }}
              className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}
            >
              {/* Section Header */}
              <div className={`flex items-center gap-3 px-5 py-4 border-b ${isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-100 bg-gray-50'}`}>
                <Icon size={16} className="text-green-600" />
                <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</span>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {items.map(({ label, desc, control }) => (
                  <div key={label} className="flex items-center justify-between px-5 py-4 gap-4">
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</p>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
                    </div>
                    {control}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}
          >
            <div className={`flex items-center gap-3 px-5 py-4 border-b ${isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-100 bg-gray-50'}`}>
              <Info size={16} className="text-green-600" />
              <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>About Campus Connect</span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <img src="/images/logo.png" alt="Logo" className="w-14 h-14 object-contain" />
                <div>
                  <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Campus Connect</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Version 1.0.0</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>S.B. Jain Institute of Technology, Management & Research</p>
                </div>
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Smart Indoor Navigation & Campus Management System. Built for students, faculty, and visitors of S.B. Jain Institute, Nagpur. An Autonomous Institute affiliated to R.T.M. Nagpur University.
              </p>
              {[
                { label: 'Privacy Policy', onClick: () => {} },
                { label: 'Terms of Service', onClick: () => {} },
                { label: 'Contact Support', onClick: () => {} },
              ].map(({ label, onClick }) => (
                <button key={label} onClick={onClick} className={`w-full flex items-center justify-between py-3 border-t text-sm mt-2 ${isDark ? 'border-gray-700 text-gray-400 hover:text-white' : 'border-gray-100 text-gray-600 hover:text-gray-900'}`}>
                  {label}
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Save & Logout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-3"
          >
            <button
              onClick={handleSave}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${saved ? 'bg-green-100 text-green-700' : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-lg'}`}
            >
              <Save size={18} />
              {saved ? '✓ Settings Saved!' : 'Save Settings'}
            </button>
            <button
              onClick={() => { localStorage.clear(); navigate('/'); }}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-red-500 border-2 border-red-200 transition-all hover:bg-red-50 ${isDark ? 'border-red-900/50 hover:bg-red-900/20' : ''}`}
            >
              <LogOut size={18} />
              Logout
            </button>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
