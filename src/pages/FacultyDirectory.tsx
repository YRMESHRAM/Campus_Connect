import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Navigation, Star } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../supabaseClient';
import { fetchFacultyFromSupabase, getCachedFacultyData, getFacultyAvailability, subscribeFacultyStatusChanges, startPolling } from '../utils/facultyStore';

const availabilityConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  available: { label: 'Available', color: 'text-green-700', bg: 'bg-green-100', dot: 'bg-green-500' },
  busy: { label: 'Busy', color: 'text-yellow-700', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
  'in-lecture': { label: 'In Lecture', color: 'text-blue-700', bg: 'bg-blue-100', dot: 'bg-blue-500' },
  offline: { label: 'Unavailable (Off Hours)', color: 'text-red-700', bg: 'bg-red-100', dot: 'bg-red-500' },
};

// Helper function to calculate time slot and working hours availability
export function getCurrentTeacherStatus(teacher: any, targetTime: Date = new Date()): string {
  const hours = targetTime.getHours();
  const minutes = targetTime.getMinutes();
  const currentTimeInMinutes = hours * 60 + minutes;

  const startTime = 10 * 60 + 30; // 10:30 AM (630 mins)
  const endTime = 17 * 60 + 30;   // 05:30 PM (1050 mins)

  // 1. Force "offline" outside working hours (Before 10:30 AM or After 5:30 PM)
  if (currentTimeInMinutes < startTime || currentTimeInMinutes > endTime) {
    return "offline";
  }

  // 2. Check current time slot during working hours
  let currentActivity = "";
  if (currentTimeInMinutes >= 10 * 60 + 30 && currentTimeInMinutes < 11 * 60 + 30) currentActivity = teacher["10:30 - 11:30"] || teacher.slot_1030_1130;
  else if (currentTimeInMinutes >= 11 * 60 + 30 && currentTimeInMinutes < 12 * 60 + 30) currentActivity = teacher["11:30 - 12:30"] || teacher.slot_1130_1230;
  else if (currentTimeInMinutes >= 12 * 60 + 30 && currentTimeInMinutes < 13 * 60 + 30) currentActivity = teacher["12:30 - 1:30"] || teacher.slot_1230_1330;
  else if (currentTimeInMinutes >= 13 * 60 + 30 && currentTimeInMinutes < 14 * 60 + 30) currentActivity = teacher["1:30 - 2:30"] || teacher.slot_1330_1430;
  else if (currentTimeInMinutes >= 14 * 60 + 30 && currentTimeInMinutes < 15 * 60 + 30) currentActivity = teacher["2:30 - 3:30"] || teacher.slot_1430_1530;
  else if (currentTimeInMinutes >= 15 * 60 + 30 && currentTimeInMinutes < 16 * 60 + 30) currentActivity = teacher["3:30 - 4:30"] || teacher.slot_1530_1630;
  else if (currentTimeInMinutes >= 16 * 60 + 30 && currentTimeInMinutes <= 17 * 60 + 30) currentActivity = teacher["4:30 - 5:30"] || teacher.slot_1630_1730;

  if (!currentActivity || currentActivity.toLowerCase().includes("available")) {
    return "available";
  }

  return "in-lecture";
}

const FacultyDirectory: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [availFilter, setAvailFilter] = useState('All');
  const [alphaFilter, setAlphaFilter] = useState('All');

  const [facultyData, setFacultyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFaculty() {
      const data = await fetchFacultyFromSupabase();
      setFacultyData(data);
      setLoading(false);
    }

    fetchFaculty();

    const stopPolling = startPolling((newData) => {
      setFacultyData(newData);
    }, 10000);

    const unsubscribeLocal = subscribeFacultyStatusChanges(() => {
      setFacultyData([...getCachedFacultyData()]);
    });

    let channel: any;
    try {
      channel = supabase
        .channel('faculty-status-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'faculty_schedules' },
          () => {
            fetchFacultyFromSupabase().then((data) => setFacultyData(data));
          }
        )
        .subscribe();
    } catch (_) { /* ignore */ }

    return () => {
      stopPolling();
      unsubscribeLocal();
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const departments = ['All', ...Array.from(new Set(facultyData.map((f) => f["Department"] || f.department).filter(Boolean)))];
  const availabilities = ['All', 'available', 'busy', 'in-lecture', 'offline'];
  const alphabets = ['All', 'A-F', 'G-L', 'M-R', 'S-Z'];

  const filtered = facultyData.filter((f) => {
    const name = f["Faculty Name"] || f.name || '';
    const dept = f["Department"] || f.department || '';

    // Default to 'auto' instead of 'available' so schedule/time check runs properly
    const currentAvailability = getFacultyAvailability(name, f.availability || 'auto');
    const dynamicStatus = (currentAvailability && currentAvailability !== 'auto') 
      ? currentAvailability 
      : getCurrentTeacherStatus(f);

    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || dept.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || dept === deptFilter;
    const matchAvail = availFilter === 'All' || dynamicStatus === availFilter;
    let matchAlpha = true;
    if (alphaFilter !== 'All') {
      const cleanName = name.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s+/i, '').trim();
      const firstChar = cleanName.charAt(0).toUpperCase();
      const ranges: Record<string, [string, string]> = { 'A-F': ['A', 'F'], 'G-L': ['G', 'L'], 'M-R': ['M', 'R'], 'S-Z': ['S', 'Z'] };
      const range = ranges[alphaFilter];
      if (range) {
        const [start, end] = range;
        matchAlpha = firstChar >= start && firstChar <= end;
      }
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
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-500'}`}
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
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {loading ? 'Loading...' : `${filtered.length} faculty members found`}
            </span>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <p className="text-lg font-medium animate-pulse">Fetching faculty data from Supabase...</p>
          </div>
        )}

        {/* Faculty Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((faculty, i) => {
              const teacherName = faculty["Faculty Name"] || faculty.name || 'Faculty Member';
              const department = faculty["Department"] || faculty.department || 'N/A';
              const cabin = faculty["Cabin No."] || faculty.cabin || 'N/A';
              
              const currentAvail = getFacultyAvailability(teacherName, faculty.availability || 'auto');
              const rawStatus = (currentAvail && currentAvail !== 'auto')
                ? currentAvail
                : getCurrentTeacherStatus(faculty);
                
              const status = availabilityConfig[rawStatus] || { 
                label: 'Unavailable', 
                color: 'text-red-700', 
                bg: 'bg-red-100', 
                dot: 'bg-red-500' 
              };
              
              const isHOD = faculty.isHOD || teacherName.toLowerCase().includes('hod') || faculty["10:30 - 11:30"]?.toLowerCase().includes('hod');
              const photoUrl = faculty.photo || '/images/blank.jpg';

              return (
                <motion.div
                  key={faculty.id || i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className={`rounded-2xl border overflow-hidden transition-all ${isDark ? 'bg-gray-800 border-gray-700 hover:border-purple-600/30' : 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300'}`}
                >
                  {/* Card Header */}
                  <div className={`p-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img
                          src={photoUrl}
                          alt={teacherName}
                          className="w-16 h-16 rounded-2xl object-cover shadow-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/blank.jpg';
                          }}
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${status.dot} rounded-full border-2 border-white`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className={`font-bold text-sm leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{teacherName}</h3>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{faculty.designation || 'Faculty Member'}</p>
                          </div>
                          {isHOD && (
                            <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                              <Star size={10} /> HOD
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-1 font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{department}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <MapPin size={12} className="text-green-500" />
                        Cabin: {cabin}
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        🏢 {faculty.building || 'Main Campus'}
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} col-span-2`}>
                        <span>🕐</span> 10:30 AM - 05:30 PM
                      </div>
                    </div>

                    {/* Schedule Preview */}
                    <div className={`mb-3 p-2 rounded-xl text-xs ${isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                      <div className="flex justify-between border-b border-gray-200/20 pb-1 mb-1 font-semibold text-purple-500">
                        <span>Time Slot</span>
                        <span>Activity</span>
                      </div>
                      <div className="flex justify-between">
                        <span>10:30 - 11:30:</span>
                        <span className="font-medium text-right">{faculty["10:30 - 11:30"] || 'Available'}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>11:30 - 12:30:</span>
                        <span className="font-medium text-right">{faculty["11:30 - 12:30"] || 'Available'}</span>
                      </div>
                    </div>

                    {/* Availability Status */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}>
                        <div className={`w-1.5 h-1.5 ${status.dot} rounded-full`} />
                        {status.label}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => navigate(`/faculty/${encodeURIComponent(teacherName)}`)}
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
        )}

        {!loading && filtered.length === 0 && (
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