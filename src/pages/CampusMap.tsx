import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  User,
  MapPin,
  Navigation,
  Maximize2,
  Minimize2,
  RotateCcw,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';

interface FacultyMember {
  id: string;
  name: string;
  department: string;
  cabin: string;
  block: string;
  floor: number;
}

const facultyList: FacultyMember[] = [
  { id: '1', name: 'Ms. Swati Thakur',       department: 'CSE (AI&ML)',    cabin: 'M202',   block: 'M', floor: 2 },
  { id: '2', name: 'Ms. Harshika Dehariya',  department: 'CSE (AI&ML)',    cabin: 'M204',   block: 'M', floor: 2 },
  { id: '3', name: 'Dr. Animesh Tayal',      department: 'CSE (AI&ML)',    cabin: 'M107',   block: 'M', floor: 1 },
  { id: '4', name: 'Prof. Rashmi Deshmukh',  department: 'First Year',     cabin: 'F102',   block: 'F', floor: 1 },
  { id: '5', name: 'Dr. Narendra Bawane',    department: 'Administration', cabin: 'ADM101', block: 'ADM', floor: 1 },
  { id: '6', name: 'Prof. Amit Sharma',      department: 'ETC / MCA',      cabin: 'E201',   block: 'E', floor: 2 },
  { id: '7', name: 'Dr. Suresh Kumar',       department: 'Mechanical',     cabin: 'B101',   block: 'B', floor: 1 },
];

const blockInfo: Record<string, { label: string; color: string }> = {
  F:   { label: 'Block F – First Year',                       color: '#16a34a' },
  ADM: { label: 'Admin Block – Principal Office',             color: '#eab308' },
  E:   { label: 'Block E – ETC / MBA / BCA / MCA',            color: '#3b82f6' },
  B:   { label: 'Block B – Mechanical / Electrical',          color: '#f97316' },
  M:   { label: 'Block M – CSE / AIML / DS / IT',             color: '#84cc16' },
};

const floorLabels = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'];

const CampusMap: React.FC = () => {
  const { isDark } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [_iframeReady, setIframeReady] = useState(false);

  const filteredFaculty = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return facultyList.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.department.toLowerCase().includes(q) ||
        f.cabin.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  /** Send a postMessage to the iframe to highlight a floor */
  const sendFloorToIframe = (floor: number) => {
    try {
      iframeRef.current?.contentWindow?.postMessage({ type: 'SHOW_FLOOR', floor }, '*');
    } catch (_) {}
  };

  const handleSelectFaculty = (faculty: FacultyMember) => {
    setSelectedFaculty(faculty);
    setSearchQuery('');
    sendFloorToIframe(faculty.floor);
  };

  const handleReset = () => {
    setSelectedFaculty(null);
    sendFloorToIframe(0);
  };

  const toggleFullscreen = () => setIsFullscreen((f) => !f);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className={`text-2xl md:text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Campus Map <span className="text-green-500 text-lg font-bold ml-2">3D</span>
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            S.B. Jain Institute of Technology, Management &amp; Research — Interactive 3D Building Map
          </p>
        </motion.div>

        {/* Search & Faculty Quick-Select */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search faculty, department or cabin (e.g. Swati Thakur, M202)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-green-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500'
              }`}
            />

            {/* Dropdown */}
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
                        isDark
                          ? 'border-gray-700 hover:bg-gray-700 text-white'
                          : 'border-gray-100 hover:bg-gray-50 text-gray-800'
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

          {/* Faculty Quick Select */}
          <div className="flex items-center gap-2">
            <User size={16} className="text-green-600 shrink-0" />
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

          {/* Reset button */}
          <button
            onClick={handleReset}
            className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              isDark
                ? 'bg-gray-800 border border-gray-700 text-gray-300 hover:border-gray-500'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-green-500'
            }`}
          >
            <RotateCcw size={15} /> Reset
          </button>
        </div>

        {/* Main Grid */}
        <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
          {/* 3D Map iframe */}
          <div className={isFullscreen ? 'col-span-1' : 'lg:col-span-3'}>
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative rounded-3xl overflow-hidden border shadow-lg ${
                isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-100'
              }`}
              style={{ height: isFullscreen ? '78vh' : '560px' }}
            >
              <iframe
                ref={iframeRef}
                src="/map3d/campus-3d.html"
                title="3D Campus Map"
                className="w-full h-full border-0"
                onLoad={() => setIframeReady(true)}
                allow="fullscreen"
              />

              {/* Fullscreen toggle */}
              <button
                onClick={toggleFullscreen}
                className={`absolute right-4 top-4 p-2.5 rounded-xl shadow-lg z-40 transition-all ${
                  isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>

              {/* Selected faculty cabin badge */}
              <AnimatePresence>
                {selectedFaculty && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-4 bottom-4 z-40 flex items-center gap-2 bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xl"
                  >
                    <MapPin size={14} />
                    <span>
                      {selectedFaculty.name} · Cabin {selectedFaculty.cabin} ·{' '}
                      {floorLabels[selectedFaculty.floor]}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Hint bar */}
            <p className={`text-xs mt-2 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              🖱 Drag to orbit · Scroll to zoom · Use the floor/view controls inside the map panel
            </p>
          </div>

          {/* Right Sidebar – hidden when fullscreen */}
          {!isFullscreen && (
            <div className="space-y-4">
              {/* Selected Faculty Card */}
              <AnimatePresence>
                {selectedFaculty && (
                  <motion.div
                    key={selectedFaculty.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`p-4 rounded-2xl border ${
                      isDark
                        ? 'bg-green-950/40 border-green-700/80 text-white'
                        : 'bg-green-50 border-green-200 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-green-500/20">
                      <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">
                        Navigation Target
                      </span>
                      <span className="text-[10px] font-bold bg-green-600 text-white px-2 py-0.5 rounded-full">
                        {floorLabels[selectedFaculty.floor]}
                      </span>
                    </div>
                    <div className="text-xs space-y-1 pt-1">
                      <p><strong>Faculty:</strong> {selectedFaculty.name}</p>
                      <p><strong>Dept:</strong> {selectedFaculty.department}</p>
                      <p>
                        <strong>Block:</strong>{' '}
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full mr-1 align-middle"
                          style={{ backgroundColor: blockInfo[selectedFaculty.block]?.color }}
                        />
                        {blockInfo[selectedFaculty.block]?.label}
                      </p>
                      <p><strong>Cabin / Room:</strong> {selectedFaculty.cabin}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Floor quick-switch */}
              <div
                className={`p-3 rounded-2xl border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Layers size={14} className="text-green-500" />
                  <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Floor Quick-Switch
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {floorLabels.map((label, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendFloorToIframe(idx)}
                      className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                        isDark
                          ? 'bg-gray-700 text-gray-200 hover:bg-green-700 hover:text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-800'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Faculty List */}
              <div>
                <h3 className={`font-bold mb-2 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Faculty Members
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {facultyList.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleSelectFaculty(f)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${
                        selectedFaculty?.id === f.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : isDark
                          ? 'border-gray-700 bg-gray-800 hover:bg-gray-750'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{f.name}</p>
                        <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {f.department}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded font-mono font-bold text-[10px]">
                          {f.cabin}
                        </span>
                        <ChevronRight size={12} className="text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div
                className={`p-3 rounded-2xl border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <h3 className={`font-bold mb-2 text-xs uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Map Legend
                </h3>
                <div className="space-y-1.5">
                  {Object.entries(blockInfo).map(([id, { label, color }]) => (
                    <div key={id} className="flex items-center gap-2 text-[11px]">
                      <span
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{label}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 space-y-1">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="w-3 h-3 rounded-sm shrink-0 bg-[#7eb6d9]" />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Labs / Halls / Library</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="w-3 h-3 rounded-sm shrink-0 bg-[#d89a62]" />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>HOD Room</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="w-3 h-3 rounded-sm shrink-0 bg-[#c5ced6]" />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Washroom / Stairs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CampusMap;