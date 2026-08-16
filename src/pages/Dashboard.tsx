import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, BookOpen, Users, Phone, Navigation, MessageSquare, Bell, TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import { fetchFacultyFromSupabase, getCachedFacultyData, subscribeFacultyStatusChanges, startPolling } from '../utils/facultyStore';

const Dashboard: React.FC = () => {
  const { isDark } = useTheme();

  const [availableFacultyCount, setAvailableFacultyCount] = useState<number>(0);

  const [recentActivities, setRecentActivities] = useState<Array<{ text: string; time: string; dot: string }>>([
    { text: 'Computer Lab 1 is now available', time: '5 min ago', dot: 'bg-green-500' },
    { text: 'Faculty Portal synchronized with real-time status', time: '12 min ago', dot: 'bg-blue-500' },
    { text: 'Fire drill scheduled for tomorrow 11 AM', time: '1 hr ago', dot: 'bg-red-500' },
    { text: 'TechVista 2025 registrations now open', time: '3 hrs ago', dot: 'bg-purple-500' },
  ]);

  useEffect(() => {
    const updateCountFromList = (list: any[]) => {
      const count = list.filter((f) => f.availability === 'available').length;
      setAvailableFacultyCount(count);
    };

    fetchFacultyFromSupabase().then((data) => {
      updateCountFromList(data);
    });

    const stopPolling = startPolling((newData) => {
      updateCountFromList(newData);
    }, 10000);

    const unsubscribe = subscribeFacultyStatusChanges((detail) => {
      updateCountFromList(getCachedFacultyData());
      if (detail.name && detail.status) {
        const formattedStatus = detail.status === 'in-lecture' ? 'In Lecture' : detail.status.charAt(0).toUpperCase() + detail.status.slice(1);
        setRecentActivities((prev) => [
          { text: `${detail.name} changed status to ${formattedStatus}`, time: 'Just now', dot: 'bg-green-500' },
          ...prev.slice(0, 4),
        ]);
      }
    });

    return () => {
      stopPolling();
      unsubscribe();
    };
  }, []);

  const quickCards = [
    {
      icon: BookOpen,
      title: 'Classroom & Lab Finder',
      desc: 'Find rooms, labs, and facilities across campus with real-time availability.',
      to: '/classroom-finder',
      gradient: 'from-blue-500 to-blue-700',
      bg: isDark ? 'from-blue-900/30 to-blue-800/20' : 'from-blue-50 to-blue-100/50',
      stats: '5 Rooms Available',
    },
    {
      icon: Users,
      title: 'Faculty Directory',
      desc: 'View all faculty with cabin locations and live availability status.',
      to: '/faculty-directory',
      gradient: 'from-purple-500 to-purple-700',
      bg: isDark ? 'from-purple-900/30 to-purple-800/20' : 'from-purple-50 to-purple-100/50',
      stats: `${availableFacultyCount} Faculty Available`,
    },
    {
      icon: Phone,
      title: 'Emergency Contacts',
      desc: 'Quick access to security, medical, fire safety and administration.',
      to: '/emergency',
      gradient: 'from-red-500 to-red-700',
      bg: isDark ? 'from-red-900/30 to-red-800/20' : 'from-red-50 to-red-100/50',
      stats: '5 Emergency Contacts',
    },
    {
      icon: MessageSquare,
      title: 'Feedback',
      desc: 'Share your experience and suggestions to improve campus services.',
      to: '/feedback',
      gradient: 'from-green-500 to-green-700',
      bg: isDark ? 'from-green-900/30 to-green-800/20' : 'from-green-50 to-green-100/50',
      stats: 'Your Voice Matters',
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl overflow-hidden mb-8 relative ${isDark ? 'bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-r from-green-700 to-blue-800'}`}
        >
          <div className="absolute inset-0">
            <img src="/images/campus.jpg" alt="" className="w-full h-full object-cover opacity-10" />
          </div>
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white">Campus Connect</h1>
              <p className="text-white/70 text-sm mt-1">S.B. Jain Institute of Technology, Management &amp; Research</p>
            </div>
            <div className="flex gap-3">
              <Link to="/campus-map" className="btn-primary flex items-center gap-2 whitespace-nowrap">
                <Navigation size={16} /> Start Navigation
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Campus Map Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-3xl overflow-hidden mb-8 border ${isDark ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}
        >
          <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                <MapPin size={18} className="text-white" />
              </div>
              <div>
                <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Interactive Campus Map</h2>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>S.B. Jain Institute • All Buildings</p>
              </div>
            </div>
            <Link to="/campus-map" className="btn-primary flex items-center gap-2 text-sm py-2">
              <Navigation size={14} /> Full Map
            </Link>
          </div>
          <div className="relative">
            <img src="/images/campus.jpg" alt="Campus Map" className="w-full h-56 md:h-72 object-cover" />
            <div className={`absolute inset-0 ${isDark ? 'bg-gray-900/40' : 'bg-black/10'}`} />

            {/* Map Markers */}
            {[
              { x: '20%', y: '40%', label: 'Block A', delay: 0 },
              { x: '45%', y: '30%', label: 'Block B', delay: 0.3 },
              { x: '70%', y: '50%', label: 'Block C', delay: 0.6 },
              { x: '60%', y: '70%', label: 'Admin', delay: 0.9 },
            ].map(({ x, y, label, delay }) => (
              <motion.div
                key={label}
                style={{ left: x, top: y }}
                className="absolute"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 0.5 }}
              >
                <div className="relative flex flex-col items-center">
                  <div className="pin-bounce">
                    <MapPin size={24} className="text-green-500 drop-shadow-lg" fill="#16a34a" />
                  </div>
                  <span className="mt-1 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white text-xs font-bold px-2 py-0.5 rounded-full shadow whitespace-nowrap">
                    {label}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Center CTA */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Link to="/campus-map" className="glass text-white font-semibold px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-white/20 transition-all backdrop-blur-md border border-white/30 shadow-xl">
                <Navigation size={18} />
                Start Navigation
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Quick Access Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className={`text-xl font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {quickCards.map(({ icon: Icon, title, desc, to, gradient, bg, stats }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ y: -6 }}
                className={`bg-gradient-to-br ${bg} rounded-2xl border p-5 flex flex-col gap-3 cursor-pointer group ${isDark ? 'border-gray-700/50 hover:border-green-600/30' : 'border-gray-200/80 hover:border-green-300 shadow-sm hover:shadow-md'} transition-all duration-300`}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className="text-white" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{desc}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{stats}</span>
                  <Link
                    to={to}
                    className={`bg-gradient-to-br ${gradient} text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity`}
                  >
                    Open →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`lg:col-span-2 rounded-2xl border p-5 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}
          >
            <div className="flex items-center gap-3 mb-5">
              <Bell size={18} className="text-green-600" />
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {recentActivities.map((item, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <div className={`w-2 h-2 ${item.dot} rounded-full mt-1.5 flex-shrink-0`} />
                  <div className="flex-1">
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.text}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Institute Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}
          >
            <img src="/images/banner.jpg" alt="SB Jain" className="w-full h-auto object-contain bg-white" />
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <img src="/images/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                <div>
                  <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>S.B. Jain Institute</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>An Autonomous Institute</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { icon: TrendingUp, label: '8 Departments' },
                  { icon: Users, label: '80+ Faculty' },
                  { icon: BookOpen, label: '100+ Classrooms' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Icon size={14} className="text-green-500" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;