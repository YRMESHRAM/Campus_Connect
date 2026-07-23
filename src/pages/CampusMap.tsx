import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ZoomIn, ZoomOut, RotateCcw, Search, Layers } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';

const buildings = [
  { id: 'A', name: 'Block A', desc: 'CSE & IT Departments', x: '18%', y: '35%', color: '#16a34a' },
  { id: 'B', name: 'Block B', desc: 'ECE Department', x: '42%', y: '28%', color: '#2563eb' },
  { id: 'C', name: 'Block C', desc: 'Mechanical Dept', x: '65%', y: '45%', color: '#7c3aed' },
  { id: 'D', name: 'Block D', desc: 'Civil Dept & Labs', x: '78%', y: '32%', color: '#dc2626' },
  { id: 'ADM', name: 'Admin Block', desc: 'Administration', x: '50%', y: '65%', color: '#d97706' },
];

const floors = ['Ground Floor', 'First Floor', 'Second Floor', 'Third Floor'];

const CampusMap: React.FC = () => {
  const { isDark } = useTheme();
  const [zoom, setZoom] = useState(1);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState('Ground Floor');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoute, setShowRoute] = useState(false);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.6));
  const handleReset = () => { setZoom(1); setSelectedBuilding(null); setShowRoute(false); };

  const selected = buildings.find((b) => b.id === selectedBuilding);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className={`text-2xl md:text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Campus Map</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>S.B. Jain Institute of Technology, Management & Research</p>
        </motion.div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search room, lab, cabin, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-green-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500'}`}
            />
          </div>
          {/* Floor Selector */}
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-green-600" />
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className={`py-3 px-4 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            >
              {floors.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          {/* Route Toggle */}
          <button
            onClick={() => setShowRoute(!showRoute)}
            className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${showRoute ? 'bg-green-600 text-white' : isDark ? 'bg-gray-800 border border-gray-700 text-gray-300' : 'bg-white border border-gray-200 text-gray-700 hover:border-green-500'}`}
          >
            {showRoute ? '🔴 Stop Route' : '🟢 Show Route'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative rounded-3xl overflow-hidden border shadow-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              style={{ height: '500px' }}
            >
              {/* Map Image */}
              <div
                className="w-full h-full transition-transform duration-300 origin-center"
                style={{ transform: `scale(${zoom})` }}
              >
                <img src="/images/campus.jpg" alt="Campus Map" className="w-full h-full object-cover" />
                <div className={`absolute inset-0 ${isDark ? 'bg-gray-900/30' : 'bg-black/5'}`} />

                {/* Route Line */}
                {showRoute && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <motion.path
                      d="M 80,200 Q 200,150 300,200 Q 380,240 450,200"
                      stroke="#16a34a"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="8 4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.circle
                      cx="80" cy="200" r="6"
                      fill="#16a34a"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.circle
                      cx="450" cy="200" r="6"
                      fill="#dc2626"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    />
                  </svg>
                )}

                {/* Building Markers */}
                {buildings.map(({ id, name, x, y, color }) => (
                  <motion.div
                    key={id}
                    style={{ left: x, top: y }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => setSelectedBuilding(selectedBuilding === id ? null : id)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex flex-col items-center">
                      <motion.div
                        className="pin-bounce"
                        animate={selectedBuilding === id ? { y: [0, -8, 0] } : {}}
                        transition={{ duration: 0.8, repeat: selectedBuilding === id ? Infinity : 0 }}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg text-white font-bold text-sm border-2 border-white"
                          style={{ backgroundColor: color }}
                        >
                          {id}
                        </div>
                      </motion.div>
                      {selectedBuilding === id && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 bg-white/95 backdrop-blur text-gray-900 text-xs font-bold px-2 py-1 rounded-lg shadow-lg whitespace-nowrap border border-gray-100"
                        >
                          {name}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Zoom Controls */}
              <div className="absolute right-4 top-4 flex flex-col gap-2">
                <button
                  onClick={handleZoomIn}
                  className={`p-2.5 rounded-xl shadow-lg transition-all ${isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  onClick={handleZoomOut}
                  className={`p-2.5 rounded-xl shadow-lg transition-all ${isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  onClick={handleReset}
                  className={`p-2.5 rounded-xl shadow-lg transition-all ${isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  <RotateCcw size={18} />
                </button>
              </div>

              {/* Floor Badge */}
              <div className="absolute left-4 top-4 bg-white/90 backdrop-blur text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-xl shadow border border-gray-100">
                📍 {selectedFloor}
              </div>

              {/* Zoom Level */}
              <div className={`absolute left-4 bottom-4 text-xs font-medium px-3 py-1.5 rounded-xl ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-white/90 text-gray-600 border border-gray-100 shadow'}`}>
                Zoom: {Math.round(zoom * 100)}%
              </div>
            </motion.div>
          </div>

          {/* Building Info Panel */}
          <div className="space-y-4">
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Buildings</h3>
            {buildings.map(({ id, name, desc, color }) => (
              <motion.button
                key={id}
                onClick={() => setSelectedBuilding(selectedBuilding === id ? null : id)}
                whileHover={{ x: 4 }}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedBuilding === id
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : isDark ? 'border-gray-700 bg-gray-800 hover:border-gray-600' : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: color }}
                  >
                    {id}
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{name}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
                  </div>
                </div>
              </motion.button>
            ))}

            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border ${isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-green-600" />
                  <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{selected.name}</h4>
                </div>
                <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{selected.desc}</p>
                <button
                  onClick={() => setShowRoute(true)}
                  className="w-full btn-primary py-2 text-sm"
                >
                  Navigate Here
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CampusMap;
