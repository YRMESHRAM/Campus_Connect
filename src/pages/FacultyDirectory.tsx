import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Navigation, Star } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import facultyData from '../data/faculty.json';

const availabilityConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  available: { label: 'Available', color: 'text-green-700', bg: 'bg-green-100', dot: 'bg-green-500' },
  busy: { label: 'Busy', color: 'text-yellow-700', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
  'in-lecture': { label: 'In Lecture', color: 'text-blue-700', bg: 'bg-blue-100', dot: 'bg-blue-500' },
  offline: { label: 'Offline', color: 'text-gray-600', bg: 'bg-gray-100', dot: 'bg-gray-400' },
};

const FacultyDirectory: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [availFilter, setAvailFilter] = useState('All');
  const [alphaFilter, setAlphaFilter] = useState('All');

  const departments = ['All', ...Array.from(new Set(facultyData.map((f) => f.department)))];
  const availabilities = ['All', 'available', 'busy', 'in-lecture', 'offline'];
  const alphabets = ['All', 'A-F', 'G-L', 'M-R', 'S-Z'];

  const filtered = facultyData.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || f.department === deptFilter;
    const matchAvail = availFilter === 'All' || f.availability === availFilter;
    let matchAlpha = true;
    if (alphaFilter !== 'All') {
      const firstChar = f.name.charAt(f.name.indexOf(' ') + 1).toUpperCase();
      const ranges: Record<string, [string, string]> = { 'A-F': ['A', 'F'], 'G-L': ['G', 'L'], 'M-R': ['M', 'R'], 'S-Z': ['S', 'Z'] };
      const [start, end] = ranges[alphaFilter];
      matchAlpha = firstChar >= start && firstChar <= end;
    }
    return matchSearch && matchDept && matchAvail && matchAlpha;
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">👤</span>
            </div>
            <div>
              <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Faculty Directory</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Find faculty, check availability and cabin location</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-4 rounded-2xl border mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}
        >
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search faculty name or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-green-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500'}`}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
                className={`py-2.5 px-3 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                <option value="All">All Departments</option>
                {departments.slice(1).map((d) => <option key={d}>{d}</option>)}
              </select>
              <select value={availFilter} onChange={(e) => setAvailFilter(e.target.value)}
                className={`py-2.5 px-3 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                <option value="All">All Status</option>
                {availabilities.slice(1).map((a) => <option key={a} value={a}>{availabilityConfig[a]?.label}</option>)}
              </select>
              <select value={alphaFilter} onChange={(e) => setAlphaFilter(e.target.value)}
                className={`py-2.5 px-3 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                {alphabets.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Filter size={14} className="text-gray-400" />
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{filtered.length} faculty members found</span>
          </div>
        </motion.div>

        {/* Faculty Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((faculty, i) => {
            const status = availabilityConfig[faculty.availability] || availabilityConfig.offline;
            return (
              <motion.div
                key={faculty.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className={`rounded-2xl border overflow-hidden transition-all ${isDark ? 'bg-gray-800 border-gray-700 hover:border-purple-600/30' : 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300'}`}
              >
                {/* Card Header */}
                <div className={`p-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={faculty.photo}
                        alt={faculty.name}
                        className="w-16 h-16 rounded-2xl object-cover shadow-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name)}&background=16a34a&color=fff&size=128`;
                        }}
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${status.dot} rounded-full border-2 border-white`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={`font-bold text-sm leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{faculty.name}</h3>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{faculty.designation}</p>
                        </div>
                        {faculty.isHOD && (
                          <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                            <Star size={10} /> HOD
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-1 font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{faculty.department}</p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <MapPin size={12} className="text-green-500" />
                      Cabin {faculty.cabin}
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      🏢 {faculty.building}
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} col-span-2`}>
                      <span>🕐</span> {faculty.officeHours}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}>
                      <div className={`w-1.5 h-1.5 ${status.dot} rounded-full`} />
                      {status.label}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{faculty.experience}</span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate(`/faculty/${faculty.id}`)}
                      className={`text-xs font-semibold py-2.5 rounded-xl transition-all ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => navigate('/campus-map')}
                      className="text-xs font-semibold py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 text-white flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                    >
                      <Navigation size={12} /> Navigate
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium">No faculty found</p>
            <p className="text-sm">Try different filters or search terms</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FacultyDirectory;
