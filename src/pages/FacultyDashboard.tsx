import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Bell, Phone, Users, Calendar, Edit3, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../supabaseClient';
import { getFacultyAvailability, updateFacultyAvailability, subscribeFacultyStatusChanges } from '../utils/facultyStore';

type AvailabilityStatus = 'auto' | 'available' | 'busy' | 'in-lecture' | 'meeting' | 'offline';

const availabilityOptions: { label: string; value: AvailabilityStatus; color: string; bg: string }[] = [
  { label: 'Auto (Schedule)', value: 'auto', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
  { label: 'Available', value: 'available', color: 'text-green-700', bg: 'bg-green-100 border-green-300' },
  { label: 'Busy', value: 'busy', color: 'text-yellow-700', bg: 'bg-yellow-100 border-yellow-300' },
  { label: 'In Lecture', value: 'in-lecture', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-300' },
  { label: 'In Meeting', value: 'meeting', color: 'text-purple-700', bg: 'bg-purple-100 border-purple-300' },
  { label: 'Offline', value: 'offline', color: 'text-gray-600', bg: 'bg-gray-100 border-gray-300' },
];

const schedule = [
  { time: '09:00 AM', subject: 'Data Structures', room: 'Room 101, Block A', students: 60, status: 'completed' },
  { time: '11:00 AM', subject: 'Machine Learning', room: 'Computer Lab 1, Block B', students: 40, status: 'active' },
  { time: '02:00 PM', subject: 'Algorithms', room: 'Room 202, Block A', students: 55, status: 'upcoming' },
  { time: '04:00 PM', subject: 'Office Hours', room: 'Cabin A-101', students: 0, status: 'upcoming' },
];

const announcements = [
  { title: 'Assignment Submission Deadline', desc: 'Data Structures assignment due on Friday 5 PM.', time: '2 hours ago', type: 'assignment' },
  { title: 'Department Meeting', desc: 'CSE faculty meeting on Monday at 10 AM in Seminar Hall.', time: '1 day ago', type: 'meeting' },
  { title: 'Result Publication', desc: 'Mid-semester results published on college portal.', time: '2 days ago', type: 'result' },
];

const queries = [
  { student: 'Arjun Mehta', query: 'Can I get an extension for the DS assignment?', time: '30 min ago', read: false },
  { student: 'Priya Kulkarni', query: 'Please share notes for Unit 4 Machine Learning.', time: '2 hours ago', read: false },
  { student: 'Rahul Thakur', query: 'Requesting re-evaluation for Quiz 2.', time: '1 day ago', read: true },
];

const FacultyDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const facultyName = localStorage.getItem('facultyName') || 'Dr. Rajesh Sharma';
  const facultyDepartment = localStorage.getItem('facultyDepartment') || 'Computer Science & Engineering';
  const facultyCabin = localStorage.getItem('facultyCabin') || 'Cabin A-101';
  const facultyDesignation = localStorage.getItem('facultyDesignation') || 'Faculty Member';
  const facultyIsHOD = localStorage.getItem('facultyIsHOD') === 'true';

  const roleDisplay = facultyIsHOD ? `HOD, ${facultyDepartment}` : `${facultyDesignation}, ${facultyDepartment}`;

  const [availability, setAvailability] = useState<AvailabilityStatus>(() => {
    return getFacultyAvailability(facultyName, 'auto');
  });

  useEffect(() => {
    // Synchronize initial status from facultyStore
    setAvailability(getFacultyAvailability(facultyName, 'auto'));

    async function fetchInitialStatus() {
      try {
        let { data, error } = await supabase
          .from('faculty_schedules')
          .select('*')
          .eq('Faculty Name', facultyName)
          .maybeSingle();

        if (error || !data) {
          const res = await supabase
            .from('faculty_schedules')
            .select('*')
            .eq('name', facultyName)
            .maybeSingle();
          data = res.data;
        }

        if (data && data.availability) {
          updateFacultyAvailability(facultyName, data.availability as AvailabilityStatus);
          setAvailability(data.availability as AvailabilityStatus);
        }
      } catch (err) {
        // Ignore Supabase connection failures
      }
    }
    fetchInitialStatus();

    // Subscribe to real-time status changes locally
    const unsubscribe = subscribeFacultyStatusChanges(() => {
      const currentAvail = getFacultyAvailability(facultyName, 'auto');
      setAvailability(currentAvail);
    });

    return () => {
      unsubscribe();
    };
  }, [facultyName]);

  const handleAvailabilityChange = async (newStatus: AvailabilityStatus) => {
    // 1. Update local state & store
    setAvailability(newStatus);
    updateFacultyAvailability(facultyName, newStatus);

    // 2. Persist to Supabase database
    try {
      const { error } = await supabase
        .from('faculty_schedules')
        .update({ availability: newStatus })
        .eq('Faculty Name', facultyName);

      if (error) {
        await supabase
          .from('faculty_schedules')
          .update({ availability: newStatus })
          .eq('name', facultyName);
      }
    } catch (err) {
      // Graceful fallback if database update fails
    }
  };

  const currentStatus = availabilityOptions.find((o) => o.value === availability) || availabilityOptions[0];

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
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/30">
                <img
                  src={localStorage.getItem('facultyPhoto') || "/images/blank.jpg"}
                  alt="Faculty"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/blank.jpg'; }}
                />
              </div>
              <div>
                <p className="text-green-300 text-sm font-medium">Welcome back 👋</p>
                <h1 className="text-2xl md:text-3xl font-black text-white">{facultyName}</h1>
                <p className="text-white/70 text-sm">{roleDisplay} • Cabin {facultyCabin}</p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link to="/faculty/profile" className="flex items-center gap-2 bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/30 transition-all backdrop-blur-sm border border-white/20">
                <Edit3 size={14} /> Edit Profile
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Availability Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl border p-5 mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}
        >
          <h2 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <div className={`w-3 h-3 rounded-full ${availability === 'available' ? 'bg-green-500 animate-pulse' : availability === 'offline' ? 'bg-gray-400' : 'bg-yellow-500'}`} />
            Current Availability Status
          </h2>
          <div className="flex flex-wrap gap-2">
            {availabilityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAvailabilityChange(opt.value)}
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
            Status set to: <strong className={currentStatus.color}>{currentStatus.label}</strong> — students can see this in Faculty Directory
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Users, label: "Today's Students", value: '155', color: 'from-blue-500 to-blue-700', bg: isDark ? 'from-blue-900/30 to-blue-800/20' : 'from-blue-50 to-blue-100/50' },
            { icon: Calendar, label: 'Classes Today', value: '3', color: 'from-green-500 to-green-700', bg: isDark ? 'from-green-900/30 to-green-800/20' : 'from-green-50 to-green-100/50' },
            { icon: MessageSquare, label: 'Student Queries', value: `${queries.filter((q) => !q.read).length}`, color: 'from-purple-500 to-purple-700', bg: isDark ? 'from-purple-900/30 to-purple-800/20' : 'from-purple-50 to-purple-100/50' },
            { icon: Bell, label: 'Announcements', value: `${announcements.length}`, color: 'from-orange-500 to-orange-700', bg: isDark ? 'from-orange-900/30 to-orange-800/20' : 'from-orange-50 to-orange-100/50' },
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
              <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`lg:col-span-2 rounded-2xl border p-5 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}
          >
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Calendar size={16} className="text-green-600" /> Today's Schedule
            </h3>
            <div className="space-y-3">
              {schedule.map((item, i) => (
                <div key={i} className={`flex items-center gap-4 p-3 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'} ${item.status === 'active' ? isDark ? 'ring-1 ring-green-500' : 'ring-1 ring-green-400 bg-green-50' : ''}`}>
                  <div className={`text-xs font-bold w-20 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.time}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.subject}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.room}{item.students > 0 ? ` • ${item.students} students` : ''}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                    item.status === 'active' ? 'bg-green-100 text-green-700' :
                    item.status === 'completed' ? 'bg-gray-100 text-gray-500' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {item.status === 'active' ? '● Live' : item.status === 'completed' ? '✓ Done' : '⏰ Upcoming'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`rounded-2xl border p-5 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}
          >
            <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Phone, label: 'Emergency', to: '/emergency', color: 'from-red-500 to-red-700' },
                { icon: Mail, label: 'Contact', to: '/feedback', color: 'from-purple-500 to-purple-700' },
                { icon: Bell, label: 'Notices', to: '/notifications', color: 'from-orange-500 to-orange-700' },
              ].map(({ icon: Icon, label, to, color }) => (
                <Link
                  key={label}
                  to={to}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br ${color} text-white hover:opacity-90 transition-all hover:-translate-y-0.5`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-semibold">{label}</span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Student Queries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`rounded-2xl border p-5 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}
          >
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <MessageSquare size={16} className="text-purple-600" /> Student Queries
              {queries.filter((q) => !q.read).length > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{queries.filter((q) => !q.read).length}</span>
              )}
            </h3>
            <div className="space-y-3">
              {queries.map((q, i) => (
                <div key={i} className={`p-3 rounded-xl ${!q.read ? (isDark ? 'bg-purple-900/20 border border-purple-800/50' : 'bg-purple-50 border border-purple-100') : isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{q.student}</span>
                    {!q.read && <div className="w-2 h-2 bg-purple-500 rounded-full" />}
                  </div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{q.query}</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{q.time}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Announcements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className={`lg:col-span-2 rounded-2xl border p-5 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}
          >
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Bell size={16} className="text-orange-500" /> Announcements
            </h3>
            <div className="space-y-3">
              {announcements.map((ann, i) => (
                <div key={i} className={`flex gap-4 p-3 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${ann.type === 'assignment' ? 'bg-orange-500' : ann.type === 'meeting' ? 'bg-blue-500' : 'bg-green-500'}`} />
                  <div>
                    <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{ann.title}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{ann.desc}</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{ann.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default FacultyDashboard;