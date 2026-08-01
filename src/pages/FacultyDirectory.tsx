import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigation, BookOpen, MessageSquare, Bell, Phone, Clock, Users, Calendar, Edit3, Mail, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../supabaseClient';

type AvailabilityStatus = 'available' | 'busy' | 'in-lecture' | 'meeting' | 'offline';

const availabilityOptions: { label: string; value: AvailabilityStatus; color: string; bg: string }[] = [
  { label: 'Available', value: 'available', color: 'text-green-700', bg: 'bg-green-100 border-green-300' },
  { label: 'Busy', value: 'busy', color: 'text-yellow-700', bg: 'bg-yellow-100 border-yellow-300' },
  { label: 'In Lecture', value: 'in-lecture', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-300' },
  { label: 'In Meeting', value: 'meeting', color: 'text-purple-700', bg: 'bg-purple-100 border-purple-300' },
  { label: 'Offline', value: 'offline', color: 'text-gray-600', bg: 'bg-gray-100 border-gray-300' },
];

export default function FacultyDashboard() {
  const { isDark } = useTheme();
  const facultyName = localStorage.getItem('facultyName') || 'Dr. Rajesh Kumar Sharma';

  const [availability, setAvailability] = useState<AvailabilityStatus>('available');
  const [facultyDetails, setFacultyDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  // 1. Fetch real faculty data and current live status from Supabase
  useEffect(() => {
    async function loadFacultyData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('faculty_schedules')
          .select('*')
          .eq('Faculty Name', facultyName)
          .maybeSingle();

        if (error) {
          console.error('Error fetching faculty dashboard data:', error);
        } else if (data) {
          setFacultyDetails(data);
          if (data.availability) {
            setAvailability(data.availability as AvailabilityStatus);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFacultyData();
  }, [facultyName]);

  // 2. Update status live in Supabase
  const handleStatusChange = async (newStatus: AvailabilityStatus) => {
    setAvailability(newStatus);
    setUpdating(true);

    const { error } = await supabase
      .from('faculty_schedules')
      .update({ availability: newStatus })
      .eq('Faculty Name', facultyName);

    if (error) {
      console.error('Failed to sync status with Supabase:', error);
      alert('Could not update status on server. Please try again.');
    }
    setUpdating(false);
  };

  const currentStatus = availabilityOptions.find((o) => o.value === availability) || availabilityOptions[0];

  if (loading) {
    return (
      <Layout isFaculty>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <p className="text-gray-500 text-sm">Loading your live dashboard...</p>
        </div>
      </Layout>
    );
  }

  // Parse schedule items from Supabase if present
  const todayClasses = [
    { time: '09:00 AM - 10:00 AM', subject: facultyDetails?.Subject || 'Lectures', room: facultyDetails?.['Cabin / Location'] || 'Assigned Classroom', status: 'completed' },
    { time: '11:00 AM - 01:00 PM', subject: 'Lab Session / Consultations', room: facultyDetails?.['Cabin / Location'] || 'Department Lab', status: 'active' },
    { time: '02:00 PM - 04:00 PM', subject: 'Office Hours & Guidance', room: facultyDetails?.['Cabin / Location'] || 'Office', status: 'upcoming' },
  ];

  return (
    <Layout isFaculty>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl overflow-hidden mb-6 relative ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gradient-to-r from-green-700 to-blue-800'}`}
        >
          <div className="absolute inset-0">
            <img src="/images/campus.jpg" alt="" className="w-full h-full object-cover opacity-10" />
          </div>
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/30 bg-green-900">
                <img
                  src={facultyDetails?.Image || `/images/faculty1.jpg`}
                  alt={facultyName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(facultyName)}&background=16a34a&color=fff&size=128`;
                  }}
                />
              </div>
              <div>
                <p className="text-green-300 text-sm font-medium">Welcome back 👋</p>
                <h1 className="text-2xl md:text-3xl font-black text-white">{facultyName}</h1>
                <p className="text-white/70 text-sm">
                  {facultyDetails?.Designation || 'Faculty Member'} • {facultyDetails?.Department || 'Computer Science'} • {facultyDetails?.['Cabin / Location'] || 'Main Block'}
                </p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link to="/faculty/profile" className="flex items-center gap-2 bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/30 transition-all backdrop-blur-sm border border-white/20">
                <Edit3 size={14} /> Edit Profile
              </Link>
              <Link to="/campus-map" className="btn-primary flex items-center gap-2 text-sm py-2.5">
                <Navigation size={14} /> Navigate
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Real-time Status Sync Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl border p-5 mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <div className={`w-3 h-3 rounded-full ${availability === 'available' ? 'bg-green-500 animate-pulse' : availability === 'offline' ? 'bg-gray-400' : 'bg-yellow-500'}`} />
              Live Availability Status
            </h2>
            {updating && <span className="text-xs text-purple-600 animate-pulse font-medium">Syncing with Supabase...</span>}
          </div>

          <div className="flex flex-wrap gap-2">
            {availabilityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                  availability === opt.value
                    ? `${opt.bg} ${opt.color} scale-105 shadow-md`
                    : isDark ? 'border-gray-700 text-gray-400 hover:border-gray-500' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className={`text-xs mt-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Status broadcasted as: <strong className={currentStatus.color}>{currentStatus.label}</strong> — updated instantly for all students in the Faculty Directory.
          </p>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Users, label: "Assigned Subject", value: facultyDetails?.Subject || 'CSE', color: 'from-blue-500 to-blue-700', bg: isDark ? 'from-blue-900/30 to-blue-800/20' : 'from-blue-50 to-blue-100/50' },
            { icon: Calendar, label: 'Today Scheduled', value: '3 Sessions', color: 'from-green-500 to-green-700', bg: isDark ? 'from-green-900/30 to-green-800/20' : 'from-green-50 to-green-100/50' },
            { icon: MessageSquare, label: 'Contact Phone', value: facultyDetails?.Phone || 'N/A', color: 'from-purple-500 to-purple-700', bg: isDark ? 'from-purple-900/30 to-purple-800/20' : 'from-purple-50 to-purple-100/50' },
            { icon: Bell, label: 'Location', value: facultyDetails?.['Cabin / Location'] || 'Office', color: 'from-orange-500 to-orange-700', bg: isDark ? 'from-orange-900/30 to-orange-800/20' : 'from-orange-50 to-orange-100/50' },
          ].map(({ icon: Icon, label, value, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={`p-4 rounded-2xl border bg-gradient-to-br ${bg} ${isDark ? 'border-gray-700/50' : 'border-gray-200/80 shadow-sm'}`}
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                <Icon size={18} className="text-white" />
              </div>
              <p className={`text-lg font-black truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Schedule & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`lg:col-span-2 rounded-2xl border p-5 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}
          >
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Calendar size={16} className="text-green-600" /> Dynamic Schedule Overview
            </h3>
            <div className="space-y-3">
              {todayClasses.map((item, i) => (
                <div key={i} className={`flex items-center gap-4 p-3 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'} ${item.status === 'active' ? isDark ? 'ring-1 ring-green-500' : 'ring-1 ring-green-400 bg-green-50' : ''}`}>
                  <div className={`text-xs font-bold w-28 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.time}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.subject}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.room}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                    item.status === 'active' ? 'bg-green-100 text-green-700' :
                    item.status === 'completed' ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.status === 'active' ? '● Current' : item.status === 'completed' ? '✓ Completed' : '⏰ Scheduled'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`rounded-2xl border p-5 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}
          >
            <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Shortcuts</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Navigation, label: 'Map', to: '/campus-map', color: 'from-green-500 to-green-700' },
                { icon: BookOpen, label: 'Rooms', to: '/classroom-finder', color: 'from-blue-500 to-blue-700' },
                { icon: Phone, label: 'Emergency', to: '/emergency', color: 'from-red-500 to-red-700' },
                { icon: Mail, label: 'Feedback', to: '/feedback', color: 'from-purple-500 to-purple-700' },
                { icon: Bell, label: 'Notices', to: '/notifications', color: 'from-orange-500 to-orange-700' },
                { icon: Clock, label: 'Profile', to: '/faculty/profile', color: 'from-teal-500 to-teal-700' },
              ].map(({ icon: Icon, label, to, color }) => (
                <Link
                  key={label}
                  to={to}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br ${color} text-white hover:opacity-90 transition-all hover:-translate-y-0.5`}
                >
                  <Icon size={18} />
                  <span className="text-xs font-semibold">{label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}