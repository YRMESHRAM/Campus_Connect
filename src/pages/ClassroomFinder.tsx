import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Clock, XCircle, Calendar, RefreshCw, Navigation, BookOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../supabaseClient';

const TIME_SLOTS = [
  "10:30-11:30",
  "11:30-12:30",
  "12:30-1:30",
  "1:30-2:30",
  "2:30-3:30",
  "3:30-4:30",
  "4:30-5:30"
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const getTodayName = (): string => {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDay = dayNames[new Date().getDay()];
  return currentDay === "Sunday" ? "Monday" : currentDay;
};

// Helper to safely get value regardless of column capitalization
const getColValue = (row: Record<string, any>, possibleKeys: string[]): string => {
  for (const key of possibleKeys) {
    if (row[key] !== undefined && row[key] !== null) {
      return String(row[key]);
    }
  }
  return '';
};

const ClassroomFinder: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [todayName] = useState<string>(getTodayName());
  const [selectedDay, setSelectedDay] = useState<string>(getTodayName());
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [floorFilter, setFloorFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchLabs(selectedDay);
  }, [selectedDay]);

  const fetchLabs = async (day: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. First attempt: Query with ilike for case-insensitive match on 'Days' or 'days'
      let { data, error } = await supabase
        .from('Classroom_Data')
        .select('*')
        .ilike('Days', day);

      // 2. If no data found, try lowercase column name 'days'
      if ((!data || data.length === 0) && !error) {
        const fallback = await supabase
          .from('Classroom_Data')
          .select('*')
          .ilike('days', day);
        if (fallback.data) data = fallback.data;
        if (fallback.error) error = fallback.error;
      }

      // 3. Fallback: Fetch all rows if specific day query fails
      if ((!data || data.length === 0) && !error) {
        const allData = await supabase.from('Classroom_Data').select('*');
        if (allData.data && allData.data.length > 0) {
          data = allData.data.filter((r: any) => {
            const rowDay = getColValue(r, ['Days', 'days', 'DAY', 'Day']).trim();
            return rowDay.toLowerCase() === day.toLowerCase();
          });
        }
      }

      console.log(`Fetched ${data?.length || 0} rows for ${day}:`, data);

      if (error) {
        console.error('Supabase Query Error:', error);
        setErrorMsg(error.message);
      } else {
        setLabs(data || []);
      }
    } catch (err: any) {
      console.error('Unexpected fetch error:', err);
      setErrorMsg(err.message || 'Failed to connect to Supabase');
    } finally {
      setLoading(false);
    }
  };

  const floorOptions = ['All', ...Array.from(new Set(labs.map((r) => getColValue(r, ['Location / Floor', 'location / floor', 'Location', 'location'])).filter(Boolean)))];

  const getRoomCurrentStatus = (room: any) => {
    const occupiedCount = TIME_SLOTS.filter((slot) => {
      const val = getColValue(room, [slot]);
      return val.trim().toLowerCase() === 'occupied';
    }).length;

    if (occupiedCount === TIME_SLOTS.length) return 'Occupied';
    if (occupiedCount === 0) return 'Available';
    return 'Partial';
  };

  const filteredRooms = labs.filter((r) => {
    const roomName = getColValue(r, ['Lab Room No.', 'lab room no.', 'Lab Room No', 'room_no']);
    const location = getColValue(r, ['Location / Floor', 'location / floor', 'Location', 'location']);

    const matchSearch =
      roomName.toLowerCase().includes(search.toLowerCase()) ||
      location.toLowerCase().includes(search.toLowerCase());

    const matchFloor = floorFilter === 'All' || location === floorFilter;

    const currentStatus = getRoomCurrentStatus(r);
    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Available' && currentStatus !== 'Occupied') ||
      (statusFilter === 'Occupied' && currentStatus === 'Occupied');

    return matchSearch && matchFloor && matchStatus;
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center">
                <BookOpen size={20} className="text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Classroom & Lab Finder
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Live lab and classroom schedules powered by Supabase
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700 shadow-sm'
              }`}>
                <Calendar size={14} className="text-blue-500" />
                Today: <span className="text-blue-600 font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
              </div>

              {selectedDay !== todayName && (
                <button
                  onClick={() => setSelectedDay(todayName)}
                  className="flex items-center gap-1 text-xs bg-blue-600 text-white font-semibold px-3 py-1.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <RefreshCw size={12} /> Back to Today
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Day Selector Tabs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className={`p-1.5 rounded-2xl border flex gap-1 overflow-x-auto ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
          }`}>
            {DAYS_OF_WEEK.map((day) => {
              const isToday = day === todayName;
              const isSelected = day === selectedDay;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : isDark
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-white'
                  }`}
                >
                  {day}
                  {isToday && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase ${
                      isSelected ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                    }`}>
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Search & Filters */}
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
                placeholder="Search room number (e.g. M-005) or floor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
                }`}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className={`py-2.5 px-3 rounded-xl border text-sm outline-none ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              >
                {floorOptions.map((f) => (
                  <option key={f} value={f}>{f === 'All' ? 'All Floors' : f}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`py-2.5 px-3 rounded-xl border text-sm outline-none ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              >
                <option value="All">All Statuses</option>
                <option value="Available">Has Available Slots</option>
                <option value="Occupied">Fully Occupied</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Filter size={14} className="text-gray-400" />
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Showing {filteredRooms.length} of {labs.length} rooms for <span className="font-semibold text-blue-500">{selectedDay}</span>
            </span>
          </div>
        </motion.div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            <strong>Supabase Error:</strong> {errorMsg}
          </div>
        )}

        {/* Cards */}
        {loading ? (
          <div className="text-center py-16">
            <RefreshCw size={32} className="mx-auto mb-3 animate-spin text-blue-500" />
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Fetching live schedule from Supabase...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room, i) => {
              const roomNo = getColValue(room, ['Lab Room No.', 'lab room no.', 'Lab Room No', 'room_no']);
              const location = getColValue(room, ['Location / Floor', 'location / floor', 'Location', 'location']);
              const currentStatus = getRoomCurrentStatus(room);
              const roomId = room.ID || room.id || i;

              return (
                <motion.div
                  key={roomId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl border transition-all ${
                    isDark
                      ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      : 'border-gray-200 bg-white hover:border-blue-300 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🔬</div>
                        <div>
                          <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Room {roomNo}
                          </h3>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {location}
                          </p>
                        </div>
                      </div>
                      
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        currentStatus === 'Available'
                          ? 'text-emerald-700 bg-emerald-100 border border-emerald-200'
                          : currentStatus === 'Occupied'
                          ? 'text-red-700 bg-red-100 border border-red-200'
                          : 'text-amber-700 bg-amber-100 border border-amber-200'
                      }`}>
                        {currentStatus === 'Available' && '✓ Open All Day'}
                        {currentStatus === 'Occupied' && '✗ Occupied'}
                        {currentStatus === 'Partial' && '⚡ Partial Slots'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-400 mb-1">
                      <span className="flex items-center gap-1"><Clock size={13} /> Time Slot</span>
                      <span>Status</span>
                    </div>

                    <div className="space-y-1.5">
                      {TIME_SLOTS.map((slot) => {
                        const status = getColValue(room, [slot]) || 'Available';
                        const isOccupied = status.trim().toLowerCase() === 'occupied';

                        return (
                          <div
                            key={slot}
                            className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                              isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                            }`}
                          >
                            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {slot}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                isOccupied
                                  ? 'bg-red-100 text-red-700 border border-red-200'
                                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {status}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => navigate('/campus-map')}
                      className="w-full mt-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <Navigation size={14} />
                      Navigate to {roomNo}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRooms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            <XCircle size={48} className="mx-auto mb-3 opacity-50 text-red-400" />
            <p className="font-medium text-lg">No lab schedule found</p>
            <p className="text-sm mt-1">Try running the SQL command in Supabase to disable RLS or check your console log (`F12`).</p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default ClassroomFinder;