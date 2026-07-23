import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Mail, Phone, Clock, Star, ArrowLeft, BookOpen, Award } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import facultyData from '../data/faculty.json';

const availabilityConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  available: { label: 'Available', color: 'text-green-700', bg: 'bg-green-100', dot: 'bg-green-500' },
  busy: { label: 'Busy', color: 'text-yellow-700', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
  'in-lecture': { label: 'In Lecture', color: 'text-blue-700', bg: 'bg-blue-100', dot: 'bg-blue-500' },
  offline: { label: 'Offline', color: 'text-gray-600', bg: 'bg-gray-100', dot: 'bg-gray-400' },
};

const FacultyProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const faculty = facultyData.find((f) => f.id === Number(id)) || facultyData[0];
  const status = availabilityConfig[faculty.availability] || availabilityConfig.offline;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 text-sm font-medium mb-6 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <ArrowLeft size={16} /> Back to Faculty Directory
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile Header Card */}
          <div className={`rounded-3xl overflow-hidden border mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-lg'}`}>
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-purple-600 via-purple-700 to-blue-800 relative">
              <div className="absolute inset-0 opacity-20">
                <img src="/images/campus.jpg" alt="" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="px-6 pb-6">
              {/* Avatar */}
              <div className="flex items-end gap-4 -mt-12 mb-4">
                <div className="relative">
                  <img
                    src={faculty.photo}
                    alt={faculty.name}
                    className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name)}&background=16a34a&color=fff&size=200`;
                    }}
                  />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${status.dot} rounded-full border-2 border-white`} />
                </div>
                <div className="pb-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{faculty.name}</h1>
                    {faculty.isHOD && (
                      <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
                        <Star size={10} /> HOD
                      </span>
                    )}
                  </div>
                  <p className={`font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{faculty.designation}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{faculty.department}</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{faculty.qualification}</p>
                </div>

                <button
                  onClick={() => navigate('/campus-map')}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  <Navigation size={16} /> Navigate to Cabin
                </button>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { icon: MapPin, label: 'Cabin Number', value: `Cabin ${faculty.cabin}`, color: 'text-green-600' },
              { icon: Clock, label: 'Office Hours', value: faculty.officeHours, color: 'text-blue-600' },
              { icon: Award, label: 'Experience', value: faculty.experience, color: 'text-purple-600' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className={`p-4 rounded-2xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={16} className={color} />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
                </div>
                <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
              <h2 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Contact Information</h2>
              <div className="space-y-3">
                <a href={`mailto:${faculty.email}`} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}>
                  <Mail size={16} className="text-green-500" />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm font-medium">{faculty.email}</p>
                  </div>
                </a>
                <a href={`tel:${faculty.phone}`} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}>
                  <Phone size={16} className="text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-sm font-medium">{faculty.phone}</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Subjects */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
              <h2 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <BookOpen size={16} className="text-purple-500" /> Subjects Taught
              </h2>
              <div className="space-y-2">
                {faculty.subjects.map((subject, i) => (
                  <motion.div
                    key={subject}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-purple-50'}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">
                      {i + 1}
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{subject}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default FacultyProfile;
