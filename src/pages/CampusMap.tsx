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
    x: '14%',
    y: '38%',
    color: '#16a34a',
    satelliteOverlay: { top: '16%', left: '7.3%', width: '12.8%', height: '44%' },
    routeTarget: { x: 130, y: 300 },
  },
  {
    id: 'ADM',
    name: 'Admin / Principal',
    desc: 'Administration & Principal Office',
    x: '31%',
    y: '20%',
    color: '#eab308',
    satelliteOverlay: { top: '14.5%', left: '25.2%', width: '12%', height: '12.5%' },
    routeTarget: { x: 310, y: 180 },
  },
  {
    id: 'E',
    name: 'Block E',
    desc: 'ETC, MBA, BCA, MCA Department',
    x: '16%',
    y: '75%',
    color: '#3b82f6',
    satelliteOverlay: { top: '61.5%', left: '6.5%', width: '20.5%', height: '27.2%' },
    routeTarget: { x: 160, y: 380 },
  },
  {
    id: 'B',
    name: 'Block B',
    desc: 'Mechanical, Electrical Department',
    x: '41%',
    y: '59%',
    color: '#f97316',
    satelliteOverlay: { top: '52.8%', left: '30.5%', width: '22.5%', height: '12.8%' },
    routeTarget: { x: 330, y: 320 },
  },
  {
    id: 'M',
    name: 'Block M',
    desc: 'CSE, AIML, DS, IT Department',
    x: '65%',
    y: '76%',
    color: '#84cc16',
    satelliteOverlay: { top: '64%', left: '53.8%', width: '22.8%', height: '25%' },
    routeTarget: { x: 500, y: 380 },
  },
];

const facultyList: FacultyMember[] = [
  { id: '1', name: 'Ms. Swati Thakur', department: 'CSE (AI&ML)', cabin: 'M202' },
  { id: '2', name: 'Ms. Harshika Dehariya', department: 'CSE (AI&ML)', cabin: 'M204' },
  { id: '3', name: 'Dr. Animesh Tayal', department: 'CSE (AI&ML)', cabin: 'M107' },
  { id: '4', name: 'Prof. Rashmi Deshmukh', department: 'First Year', cabin: 'F102' },
  { id: '5', name: 'Dr. Narendra Bawane', department: 'Administration', cabin: 'ADM101' },
  { id: '6', name: 'Prof. Amit Sharma', department: 'ETC / MCA', cabin: 'E201' },
  { id: '7', name: 'Dr. Suresh Kumar', department: 'Mechanical', cabin: 'B101' },
];

const floors = ['Ground Floor', 'First Floor', 'Second Floor', 'Third Floor'];

function parseRoomDetails(cabin: string) {
  if (!cabin) return { blockId: 'M', floorName: 'Second Floor', roomNum: '' };
  const clean = cabin.trim().toUpperCase();
  const blockId = clean.startsWith('ADM') ? 'ADM' : clean.charAt(0);
  const floorDigit = parseInt(clean.replace(/\D/g, '').charAt(0), 10) || 0;

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
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState('Ground Floor');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoute, setShowRoute] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);

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

  // Select faculty dynamically and highlight their specific block & cabin
  const handleSelectFaculty = (faculty: FacultyMember) => {
    setSelectedFaculty(faculty);
    const parsed = parseRoomDetails(faculty.cabin);
    setSelectedBuilding(parsed.blockId);
    setSelectedFloor(parsed.floorName);
    setShowRoute(true);
    setSearchQuery('');
  };

  // Select building block and auto-bind teacher for that block
  const handleSelectBuilding = (blockId: string) => {
    setSelectedBuilding(blockId);
    const facultyInBlock = facultyList.filter(
      (f) => parseRoomDetails(f.cabin).blockId === blockId
    );

    if (facultyInBlock.length > 0) {
      const currentInBlock = facultyInBlock.find((f) => f.id === selectedFaculty?.id);
      const chosenFaculty = currentInBlock || facultyInBlock[0];
      setSelectedFaculty(chosenFaculty);
      setSelectedFloor(parseRoomDetails(chosenFaculty.cabin).floorName);
    } else {
      setSelectedFaculty(null);
    }
  };

  const activeRouteBuilding =
    buildings.find((b) => b.id === (selectedBuilding || 'M')) || buildings[0];

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

        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search faculty or cabin (e.g. Swati Thakur, Rashmi Deshmukh, F102, E201)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-green-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500'
              }`}
            />

            {/* Search Results Dropdown */}
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
                        <Navigation size={10} /> Navigate
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Teacher Quick Select Dropdown */}
          <div className="flex items-center gap-2">
            <User size={16} className="text-green-600" />
            <select
              value={selectedFaculty?.id || ''}
              onChange={(e) => {
                const fac = facultyList.find((f) => f.id === e.target.value);
                if (fac) handleSelectFaculty(fac);
              }}
              className={`py-3 px-4 rounded-xl border text-sm outline-none ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              <option value="" disabled>Select Faculty</option>
              {facultyList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.cabin})
                </option>
              ))}
            </select>
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

          {/* Route Toggle Button */}
          <button
            onClick={() => {
              const nextState = !showRoute;
              setShowRoute(nextState);
              if (nextState && !selectedBuilding) {
                handleSelectBuilding('M');
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
              style={{ height: '520px' }}
            >
              <div
                className="w-full h-full relative transition-transform duration-300 origin-center"
                style={{ transform: `scale(${zoom})` }}
              >
                {/* Map Satellite Image */}
                <img
                  src={showRoute ? '/images/satellite_map.png' : '/images/campus.jpg'}
                  alt="Campus Map"
                  className="w-full h-full object-cover transition-opacity duration-300"
                />

                {/* Satellite Polygon Highlights */}
                {showRoute &&
                  buildings.map((b) => {
                    const isSelected = selectedBuilding === b.id;

                    return (
                      <div
                        key={`sat-${b.id}`}
                        onClick={() => handleSelectBuilding(b.id)}
                        style={b.satelliteOverlay}
                        className={`absolute rounded-xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/30 ring-4 ring-indigo-400/50 z-20 animate-pulse'
                            : 'border-white/50 bg-gray-900/30 hover:border-white hover:bg-gray-800/40'
                        }`}
                      >
                        {/* Block Title */}
                        <span className="text-[11px] font-black text-white bg-black/75 px-2 py-0.5 rounded shadow border border-white/20">
                          {b.name}
                        </span>

                        {/* Dynamic Destination Cabin Badge */}
                        {isSelected && selectedFaculty && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -bottom-5 bg-red-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-xl border border-white flex items-center gap-1 whitespace-nowrap z-30"
                          >
                            <MapPin size={12} />
                            {`Cabin ${selectedFaculty.cabin} • ${selectedFloor}`}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}

                {/* Navigation Route Path SVG */}
                {showRoute && selectedBuilding && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                    <motion.path
                      d={`M 40,490 L 40,240 Q 40,200 100,200 L ${activeRouteBuilding.routeTarget.x},200 L ${activeRouteBuilding.routeTarget.x},${activeRouteBuilding.routeTarget.y}`}
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

                {/* Normal Building Pins */}
                {!showRoute &&
                  buildings.map(({ id, name, x, y, color }) => {
                    const isSelected = selectedBuilding === id;
                    return (
                      <motion.div
                        key={id}
                        style={{ left: x, top: y }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30"
                        onClick={() => handleSelectBuilding(id)}
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

              {/* Zoom Controls */}
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

              {/* Floor Badge Overlay */}
              <div className="absolute left-4 top-4 bg-white/90 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-xl shadow border border-gray-100 z-40 flex items-center gap-1.5">
                <MapPin size={14} className="text-green-600" />
                <span>{selectedFloor}</span>
              </div>

              {/* Zoom Level Indicator */}
              <div
                className={`absolute left-4 bottom-4 text-xs font-medium px-3 py-1.5 rounded-xl z-40 ${
                  isDark ? 'bg-gray-800 text-gray-400' : 'bg-white/90 text-gray-600 border border-gray-100 shadow'
                }`}
              >
                Zoom: {Math.round(zoom * 100)}%
              </div>
            </motion.div>
          </div>

          {/* Right Info Sidebar */}
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
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Navigation Target</span>
                  <span className="text-[10px] font-bold bg-green-600 text-white px-2 py-0.5 rounded-full">
                    {selectedFloor}
                  </span>
                </div>
                <div className="text-xs mb-3 space-y-1 pt-1">
                  <p><strong>Faculty:</strong> {selectedFaculty.name}</p>
                  <p><strong>Department:</strong> {selectedFaculty.department}</p>
                  <p><strong>Building:</strong> {activeRouteBuilding.name}</p>
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

            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Faculty Members</h3>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {facultyList.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleSelectFaculty(f)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${
                    selectedFaculty?.id === f.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 font-bold'
                      : isDark
                      ? 'border-gray-700 bg-gray-800 hover:bg-gray-750'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <p className={isDark ? 'text-white' : 'text-gray-900'}>{f.name}</p>
                    <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{f.department}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded font-mono font-bold text-[10px]">
                    {f.cabin}
                  </span>
                </button>
              ))}
            </div>

            <h3 className={`font-bold pt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Buildings</h3>
            {buildings.map(({ id, name, desc, color }) => (
              <motion.button
                key={id}
                onClick={() => {
                  handleSelectBuilding(id);
                  if (!showRoute) setShowRoute(true);
                }}
                whileHover={{ x: 4 }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                  selectedBuilding === id
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : isDark
                    ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {id}
                  </div>
                  <div>
                    <p className={`font-semibold text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>{name}</p>
                    <p className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
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