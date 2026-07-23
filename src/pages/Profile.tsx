import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, BookOpen, Edit3, Clock, Star, Search, Camera } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import studentsData from '../data/students.json';

const Profile: React.FC = () => {
  const { isDark } = useTheme();
  const student = studentsData[0];
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: student.name, email: student.email, phone: student.phone });

  const handleSave = () => {
    setEditing(false);
    // In real app, save to backend
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>My Profile</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Manage your student profile and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-lg'}`}
          >
            {/* Banner */}
            <div className="h-24 bg-gradient-to-r from-green-600 to-emerald-700" />
            <div className="px-5 pb-5 -mt-10">
              {/* Avatar */}
              <div className="relative w-20 h-20 mb-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center border-4 border-white shadow-xl">
                  <User size={32} className="text-white" />
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-600 rounded-xl flex items-center justify-center shadow-lg hover:bg-green-700 transition-colors">
                  <Camera size={12} className="text-white" />
                </button>
              </div>
              <h2 className={`font-black text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{student.name}</h2>
              <p className={`text-sm text-green-600 font-medium mb-1`}>{student.department}</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Semester {student.semester}</p>

              <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                <p className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Enrollment No.</p>
                <p className={`font-bold text-green-600`}>{student.enrollmentNo}</p>
              </div>

              <button
                onClick={() => setEditing(!editing)}
                className={`w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Edit3 size={14} /> {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </motion.div>

          {/* Info & Edit */}
          <div className="lg:col-span-2 space-y-4">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`p-5 rounded-2xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}
            >
              <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Contact Information</h3>
              {editing ? (
                <div className="space-y-3">
                  {[
                    { label: 'Full Name', key: 'name', type: 'text' },
                    { label: 'Email Address', key: 'email', type: 'email' },
                    { label: 'Phone Number', key: 'phone', type: 'tel' },
                  ].map(({ label, key, type }) => (
                    <div key={key}>
                      <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</label>
                      <input
                        type={type}
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-green-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500'}`}
                      />
                    </div>
                  ))}
                  <button onClick={handleSave} className="btn-primary w-full py-2.5 mt-2">Save Changes</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { icon: User, label: 'Full Name', value: student.name },
                    { icon: Mail, label: 'Email', value: student.email },
                    { icon: Phone, label: 'Phone', value: student.phone },
                    { icon: BookOpen, label: 'Department', value: student.department },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <Icon size={15} className="text-green-500 flex-shrink-0" />
                      <div>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Favourite Rooms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`p-5 rounded-2xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}
            >
              <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Star size={16} className="text-yellow-500" /> Favourite Rooms
              </h3>
              <div className="flex flex-wrap gap-2">
                {student.favouriteRooms.map((room) => (
                  <span key={room} className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl font-medium ${isDark ? 'bg-green-900/30 text-green-300 border border-green-800' : 'bg-green-100 text-green-700'}`}>
                    ⭐ {room}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Recent Searches */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`p-5 rounded-2xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}
            >
              <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Search size={16} className="text-blue-500" /> Recent Searches
              </h3>
              <div className="space-y-2">
                {student.recentSearches.map((s, i) => (
                  <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <Clock size={13} className={`${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{s}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
