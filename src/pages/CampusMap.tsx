import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Layers,
  User,
  Navigation,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';

interface Building {
  id: string;
  name: string;
  desc: string;
  x: string;
  y: string;
  color: string;
  satelliteOverlay: { top: string; left: string; width: string; height: string };
  routeTarget: { x: number; y: number };
}

interface FacultyMember {
  id: string;
  name: string;
  department: string;
  cabin: string;
}

const buildings: Building[] = [
  {
    id: 'F',
    name: 'Block F',
    desc: 'First Year Department',
    x: '18%',
    y: '35%',
    color: '#16a34a',
    satelliteOverlay: { top: '5%', left: '12%', width: '23%', height: '22%' },
    routeTarget: { x: 180, y: 150 },
  },
  {
    id: 'M',
    name: 'Block M',
    desc: 'CSE, AIML, DS, IT Department',
    x: '42%',
    y: '28%',
    color: '#2563eb',
    satelliteOverlay: { top: '68%', left: '40%', width: '15%', height: '22%' },
    routeTarget: { x: 420, y: 380 },
  },
  {
    id: 'E',
    name: 'Block E',
    desc: 'ETC, MBA, BCA, MCA Department',
    x: '65%',
    y: '45%',
    color: '#7c3aed',
    satelliteOverlay: { top: '55%', left: '11%', width: '26%', height: '20%' },
    routeTarget: { x: 210, y: 340 },
  },
  {
    id: 'B',
    name: 'Block B',
    desc: 'Mechanical, Electrical Department',
    x: '78%',
    y: '32%',
    color: '#dc2626',
    satelliteOverlay: { top: '30%', left: '28%', width: '18%', height: '22%' },
    routeTarget: { x: 290, y: 220 },
  },
  {
    id: 'ADM',
    name: 'Admin Block',
    desc: 'Administration',
    x: '50%',
    y: '65%',
    color: '#d97706',
    satelliteOverlay: { top: '5%', left: '44%', width: '35%', height: '18%' },
    routeTarget: { x: 450, y: 110 },
  },
];

const facultyList: FacultyMember[] = [
  { id: '1', name: 'Ms. Swati Thakur', department: 'CSE (AI&ML)', cabin: 'M202' },
  { id: '2', name: 'Ms. Harshika Dehariya', department: 'CSE (AI&ML)', cabin: 'M202' },
  { id: '3', name: 'Dr. Animesh Tayal', department: 'CSE (AI&ML)', cabin: 'M107' },
  { id: '4', name: 'Prof. Rashmi Deshmukh', department: 'First Year', cabin: 'F102' },
  { id: '5', name: 'Dr. Narendra Bawane', department: 'Administration', cabin: 'ADM' },
];

const floors = ['Ground Floor', 'First Floor', 'Second Floor', 'Third Floor'];

function parseRoomDetails(cabin: string) {
  if (!cabin) return { blockId: 'M', floorName: 'Second Floor', roomNum: 'M202' };
  const clean = cabin.trim().toUpperCase();
  const blockId = clean.charAt(0);
  const floorDigit = parseInt(clean.charAt(1), 10);

  let floorName = 'Ground Floor';
  if (floorDigit === 1) floorName = 'First Floor';
  else if (floorDigit === 2) floorName = 'Second Floor';
  else if (floorDigit === 3) floorName = 'Third Floor';

  const validBlock = buildings.some((b) => b.id === blockId) ? blockId : 'M';
  return { blockId: validBlock, floorName, roomNum: clean };
}

const CampusMap: React.FC = () => {
  const { isDark } = useTheme();
  const [zoom, setZoom] = useState(1);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>('M');
  const [selectedFloor, setSelectedFloor] = useState('Second Floor');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoute, setShowRoute] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(facultyList[0]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.6));
  const handleReset = () => {
    setZoom(1);
    setSelectedBuilding(null);
    setSelectedFaculty(null);
    setShowRoute(false);
  };

  const filteredFaculty = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return facultyList.filter(
      (f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.cabin.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSelectFaculty = (faculty: FacultyMember) => {
    setSelectedFaculty(faculty);
    const parsed = parseRoomDetails(faculty.cabin);
    setSelectedBuilding(parsed.blockId);
    setSelectedFloor(parsed.floorName);
    setShowRoute(true);
    setSearchQuery('');
  };

  const selected = buildings.find((b) => b.id === selectedBuilding);
  const activeRouteBuilding = buildings.find((b) => b.id === (selectedBuilding || 'M')) || buildings[1];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className={`text-2xl md:text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Campus Map
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            S.B. Jain Institute of Technology, Management & Research
          </p>
        </motion.div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search room, lab, faculty (e.g. Swati Thakur)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-green-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500'
              }`}
            />

            {/* Search Dropdown */}
            <AnimatePresence>
              {filteredFaculty.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className={`absolute left-0 right-0 top-full mt-2 rounded-xl border shadow-xl z-50 overflow-hidden ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}
                >
                  {filteredFaculty.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleSelectFaculty(f)}
                      className={`w-full text-left p-3 text-xs flex items-center justify-between border-b last:border-0 transition ${
                        isDark ? 'border-gray-700 hover:bg-gray-700 text-white' : 'border-gray-100 hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      <div>
                        <p className="font-bold">{f.name}</p>
                        <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {f.department} • Cabin {f.cabin}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 bg-green-600 text-white rounded-md text-[10px] font-bold flex items-center gap-1">
                        <Navigation size={10} /> Route
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Floor Selector */}
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-green-600" />
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className={`py-3 px-4 rounded-xl border text-sm outline-none ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              {floors.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Route Toggle */}
          <button
            onClick={() => {
              const nextState = !showRoute;
              setShowRoute(nextState);
              if (nextState && !selectedBuilding) {
                setSelectedBuilding('M');
                setSelectedFloor('Second Floor');
              }
            }}
            className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              showRoute
                ? 'bg-green-600 text-white shadow-md'
                : isDark
                ? 'bg-gray-800 border border-gray-700 text-gray-300'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-green-500'
            }`}
          >
            {showRoute ? '🔴 Stop Route' : '🟢 Show Route'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Viewport */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative rounded-3xl overflow-hidden border shadow-lg ${
                isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-100'
              }`}
              style={{ height: '500px' }}
            >
              <div
                className="w-full h-full relative transition-transform duration-300 origin-center"
                style={{ transform: `scale(${zoom})` }}
              >
                {/* Dynamic Map Image Background */}
                <img
                  src={showRoute ? '/images/satellite_map.png' : '/images/campus.jpg'}
                  alt="Campus Map"
                  className="w-full h-full object-cover transition-opacity duration-300"
                />

                {/* Satellite Bounding Overlays with Teacher & Room Callout */}
                {showRoute &&
                  buildings.map((b) => {
                    const isSelected = selectedBuilding === b.id;
                    const facultyForBlock =
                      selectedFaculty && parseRoomDetails(selectedFaculty.cabin).blockId === b.id
                        ? selectedFaculty
                        : facultyList.find((f) => parseRoomDetails(f.cabin).blockId === b.id);

                    return (
                      <div
                        key={`sat-${b.id}`}
                        onClick={() => {
                          setSelectedBuilding(b.id);
                          if (facultyForBlock) setSelectedFaculty(facultyForBlock);
                        }}
                        style={b.satelliteOverlay}
                        className={`absolute rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/30 ring-4 ring-indigo-400/50 z-20 animate-pulse'
                            : 'border-gray-400/40 bg-gray-600/30 hover:border-white'
                        }`}
                      >
                        {/* Block Name Badge */}
                        <span className="text-[11px] font-black text-white bg-gray-900/80 px-2.5 py-1 rounded-md shadow border border-white/20">
                          {b.name}
                        </span>

                        {/* Selected Teacher Name & Room No Tag directly on the Block */}
                        {isSelected && facultyForBlock && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -bottom-4 bg-red-600 text-white text-[10px] md:text-[11px] font-extrabold px-3 py-1 rounded-full shadow-xl border border-white flex items-center gap-1 whitespace-nowrap z-30"
                          >
                            <MapPin size={12} />
                            {facultyForBlock.name} ({facultyForBlock.cabin} • {selectedFloor})
                          </motion.div>
                        )}
                      </div>
                    );
                  })}

                {/* Animated Navigation Route Line */}
                {showRoute && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                    <motion.path
                      d={`M 50,480 L 50,220 Q 50,180 120,180 L ${activeRouteBuilding.routeTarget.x},180 L ${activeRouteBuilding.routeTarget.x},${activeRouteBuilding.routeTarget.y}`}
                      stroke="#16a34a"
                      strokeWidth="5"
                      fill="none"
                      strokeDasharray="8 4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                    />
                  </svg>
                )}

                {/* Pins on Standard Map View */}
                {!showRoute &&
                  buildings.map(({ id, name, x, y, color }) => {
                    const isSelected = selectedBuilding === id;
                    return (
                      <motion.div
                        key={id}
                        style={{ left: x, top: y }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30"
                        onClick={() => setSelectedBuilding(selectedBuilding === id ? null : id)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="flex flex-col items-center">
                          <motion.div
                            animate={isSelected ? { y: [0, -8, 0] } : {}}
                            transition={{ duration: 0.8, repeat: isSelected ? Infinity : 0 }}
                          >
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg text-white font-bold text-sm border-2 border-white"
                              style={{ backgroundColor: color }}
                            >
                              {id}
                            </div>
                          </motion.div>

                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-1 bg-white/95 text-gray-900 text-xs font-bold px-2 py-1 rounded-lg shadow-lg whitespace-nowrap border border-gray-100"
                            >
                              {name}
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
              </div>

              {/* Map Zoom Controls */}
              <div className="absolute right-4 top-4 flex flex-col gap-2 z-40">
                <button
                  onClick={handleZoomIn}
                  className={`p-2.5 rounded-xl shadow-lg transition-all ${
                    isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  onClick={handleZoomOut}
                  className={`p-2.5 rounded-xl shadow-lg transition-all ${
                    isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  onClick={handleReset}
                  className={`p-2.5 rounded-xl shadow-lg transition-all ${
                    isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <RotateCcw size={18} />
                </button>
              </div>

              {/* Floor Badge */}
              <div className="absolute left-4 top-4 bg-white/90 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-xl shadow border border-gray-100 z-40 flex items-center gap-1.5">
                <MapPin size={14} className="text-green-600" />
                <span>{selectedFloor}</span>
              </div>

              {/* Zoom Indicator */}
              <div
                className={`absolute left-4 bottom-4 text-xs font-medium px-3 py-1.5 rounded-xl z-40 ${
                  isDark ? 'bg-gray-800 text-gray-400' : 'bg-white/90 text-gray-600 border border-gray-100 shadow'
                }`}
              >
                Zoom: {Math.round(zoom * 100)}%
              </div>
            </motion.div>
          </div>

          {/* Right Info Panel */}
          <div className="space-y-4">
            {selectedFaculty && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-green-950/40 border-green-700/80 text-white' : 'bg-green-50 border-green-200 text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-green-500/20">
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Faculty Route</span>
                  <span className="text-[10px] font-bold bg-green-600 text-white px-2 py-0.5 rounded-full">
                    {selectedFloor}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                    <User size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{selectedFaculty.name}</h4>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{selectedFaculty.department}</p>
                  </div>
                </div>
                <div className="text-xs mb-3 space-y-1">
                  <p><strong>Location:</strong> {activeRouteBuilding.name}</p>
                  <p><strong>Cabin / Room:</strong> {selectedFaculty.cabin}</p>
                </div>
                <button
                  onClick={() => setShowRoute(true)}
                  className="w-full py-2 bg-green-600 text-white rounded-xl text-xs font-bold transition hover:bg-green-700 flex items-center justify-center gap-1.5"
                >
                  <Navigation size={14} /> Show Navigation Path
                </button>
              </motion.div>
            )}

            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Buildings</h3>
            {buildings.map(({ id, name, desc, color }) => (
              <motion.button
                key={id}
                onClick={() => {
                  setSelectedBuilding(selectedBuilding === id ? null : id);
                  const facultyForBlock = facultyList.find((f) => parseRoomDetails(f.cabin).blockId === id);
                  if (facultyForBlock) setSelectedFaculty(facultyForBlock);
                  if (!showRoute) setShowRoute(true);
                }}
                whileHover={{ x: 4 }}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedBuilding === id
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : isDark
                    ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
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
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CampusMap;