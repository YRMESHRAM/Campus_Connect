import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Navigation, BookOpen, Users, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import rooms from '../data/rooms.json';

const ClassroomFinder: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('All');
  const [floorFilter, setFloorFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);

  const buildings = ['All', 'Block F', 'Block M', 'Block E', 'Block B', 'Admin Block'];
  const floors = ['All', '1', '2', '3'];
  const types = ['All', 'Classroom', 'Laboratory', 'Seminar Hall'];

  const filtered = rooms.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase());
    const matchBuilding = buildingFilter === 'All' || r.building === buildingFilter;
    const matchFloor = floorFilter === 'All' || r.floor.toString() === floorFilter;
    const matchType = typeFilter === 'All' || r.type === typeFilter;
    return matchSearch && matchBuilding && matchFloor && matchType;
  });

  const getStatusColor = (status: string) => {
    if (status === 'available') return 'text-green-600 bg-green-100';
    if (status === 'occupied') return 'text-red-600 bg-red-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getTypeIcon = (type: string) => {
    if (type === 'Laboratory') return '🔬';
    if (type === 'Seminar Hall') return '🎤';
    return '📚';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Classroom & Lab Finder</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Find rooms, labs, and facilities on campus</p>
            </div>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`p-4 rounded-2xl border mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}
        >
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search rooms, labs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-green-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500'}`}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: 'Building', value: buildingFilter, setter: setBuildingFilter, options: buildings },
                { label: 'Floor', value: floorFilter, setter: setFloorFilter, options: floors },
                { label: 'Type', value: typeFilter, setter: setTypeFilter, options: types },
              ].map(({ label, value, setter, options }) => (
                <select
                  key={label}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className={`py-2.5 px-3 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                >
                  {options.map((o) => <option key={o}>{o === 'All' ? `All ${label}s` : o}</option>)}
                </select>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Filter size={14} className="text-gray-400" />
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Showing {filtered.length} of {rooms.length} rooms
            </span>
          </div>
        </motion.div>

        {/* Room Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className={`rounded-2xl border cursor-pointer transition-all ${
                selectedRoom === room.id
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                  : isDark ? 'border-gray-700 bg-gray-800 hover:border-gray-600' : 'border-gray-200 bg-white hover:border-blue-300 shadow-sm hover:shadow-md'
              }`}
              onClick={() => setSelectedRoom(selectedRoom === room.id ? null : room.id)}
            >
              {/* Card Header */}
              <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getTypeIcon(room.type)}</div>
                    <div>
                      <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{room.name}</h3>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{room.type}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(room.status)}`}>
                    {room.status === 'available' ? '✓ Available' : '✗ Occupied'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <MapPin size={13} className="text-green-500" />
                    {room.building}
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="text-green-500">🏢</span>
                    Floor {room.floor}
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Users size={13} className="text-blue-500" />
                    Cap: {room.capacity}
                  </div>
                </div>

                <p className={`text-xs mb-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{room.description}</p>

                {/* Facilities */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {room.facilities.slice(0, 3).map((f) => (
                    <span key={f} className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{f}</span>
                  ))}
                </div>

                {/* Navigate Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); navigate('/campus-map'); }}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Navigation size={14} />
                  Navigate to {room.name}
                </button>
              </div>

              {/* Expanded Details */}
              {selectedRoom === room.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`px-4 pb-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
                >
                  <div className="pt-3">
                    <h4 className={`text-xs font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>All Facilities</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {room.facilities.map((f) => (
                        <span key={f} className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          <CheckCircle size={10} /> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            <XCircle size={48} className="mx-auto mb-3 opacity-50" />
            <p className="font-medium">No rooms found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default ClassroomFinder;
