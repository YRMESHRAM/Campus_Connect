import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Search, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Navigation, 
  RefreshCw,
  Calendar,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Compass,
  Moon
} from 'lucide-react';

interface RoomRecord {
  id?: string | number;
  [key: string]: any;
}

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

// Helper to convert slot string like "1:30-2:30" into start/end minutes from midnight
const getSlotRangeMinutes = (slotStr: string) => {
  const [startStr, endStr] = slotStr.split('-');
  
  const parseMin = (tStr: string) => {
    const parts = tStr.trim().split(':');
    let h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (h >= 1 && h <= 5) {
      h += 12;
    }
    return h * 60 + m;
  };

  return { start: parseMin(startStr), end: parseMin(endStr) };
};

// Map Block coordinates and navigation paths
const BLOCK_MAP_DATA: Record<string, { label: string; left: string; top: string; width: string; height: string; pathD: string; pinPos: { left: string; top: string } }> = {
  'Block M': {
    label: 'Block M',
    left: '54%',
    top: '65%',
    width: '24%',
    height: '30%',
    pathD: 'M 35 98 L 35 70 L 66 70 L 66 75',
    pinPos: { left: '66%', top: '75%' }
  },
  'Block F': {
    label: 'Block F',
    left: '6%',
    top: '16%',
    width: '14%',
    height: '44%',
    pathD: 'M 35 98 L 35 38 L 13 38',
    pinPos: { left: '13%', top: '38%' }
  },
  'Block B': {
    label: 'Block B',
    left: '30%',
    top: '53%',
    width: '22%',
    height: '13%',
    pathD: 'M 35 98 L 35 60',
    pinPos: { left: '35%', top: '60%' }
  },
  'Block E': {
    label: 'Block E',
    left: '5%',
    top: '65%',
    width: '22%',
    height: '30%',
    pathD: 'M 35 98 L 35 80 L 16 80',
    pinPos: { left: '16%', top: '80%' }
  },
  'Admin / Principal': {
    label: 'Admin / Principal',
    left: '23%',
    top: '14%',
    width: '14%',
    height: '12%',
    pathD: 'M 35 98 L 35 22 L 30 22',
    pinPos: { left: '30%', top: '22%' }
  }
};

export default function ClassroomFinder() {
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Live Time State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'available' | 'occupied' | 'off_hours'>('all');
  
  // Real-time Clock
  const [now, setNow] = useState<Date>(new Date());
  
  // Expandable timetable accordion per room card
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({});

  // Navigation Map Modal State
  const [navTargetRoom, setNavTargetRoom] = useState<{ name: string; floor: string; block: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Get current day name
  const currentDayName = useMemo(() => {
    const dayIndex = new Date().getDay();
    if (dayIndex === 0 || dayIndex > 6) return "Saturday";
    return DAYS_OF_WEEK[dayIndex - 1];
  }, []);

  const [selectedDay] = useState<string>(currentDayName);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Supabase data
  const fetchRoomData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('Classroom_Data')
        .select('*');

      if (fetchErr) throw fetchErr;
      setRooms(data || []);
    } catch (err: any) {
      console.error('Error fetching room occupancy data:', err);
      setError(err.message || 'Failed to fetch classroom data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomData();
  }, [selectedDay]);

  // Current active time slot calculation with operating hours validation
  const currentSlotInfo = useMemo(() => {
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const firstStart = getSlotRangeMinutes(TIME_SLOTS[0]).start; // 10:30 AM = 630 mins
    const lastEnd = getSlotRangeMinutes(TIME_SLOTS[TIME_SLOTS.length - 1]).end; // 5:30 PM = 1050 mins

    for (let i = 0; i < TIME_SLOTS.length; i++) {
      const slot = TIME_SLOTS[i];
      const { start, end } = getSlotRangeMinutes(slot);
      if (currentMin >= start && currentMin < end) {
        return {
          slot,
          index: i,
          isOperating: true,
          statusText: 'In Progress',
          timeLabel: `${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        };
      }
    }

    if (currentMin < firstStart) {
      return {
        slot: 'Off Hours',
        index: -1,
        isOperating: false,
        statusText: 'Before Class Hours',
        timeLabel: 'Classes start at 10:30 AM'
      };
    }

    return {
      slot: 'Off Hours',
      index: TIME_SLOTS.length,
      isOperating: false,
      statusText: 'Classes Ended',
      timeLabel: 'College operating hours ended at 5:30 PM'
    };
  }, [now]);

  // Helper to extract room slot value dynamically
  const getSlotStatus = (room: RoomRecord, slotKey: string): 'Available' | 'Occupied' => {
    const val = room[slotKey] || room[slotKey.replace(/\s+/g, '')] || room[slotKey.replace('-', ' - ')];
    if (!val) return 'Available';
    const cleanVal = String(val).trim().toLowerCase();
    if (cleanVal === 'occupied' || cleanVal === 'busy' || cleanVal === 'reserved') {
      return 'Occupied';
    }
    return 'Available';
  };

  // Determine block name from room code
  const getBlockName = (roomName: string): string => {
    const upper = roomName.toUpperCase().trim();
    if (upper.startsWith('F-') || upper.startsWith('F') || upper.includes('BLOCK F')) return 'Block F';
    if (upper.startsWith('B-') || upper.startsWith('B') || upper.includes('BLOCK B')) return 'Block B';
    if (upper.startsWith('E-') || upper.startsWith('E') || upper.includes('BLOCK E')) return 'Block E';
    if (upper.includes('ADMIN') || upper.includes('PRINCIPAL')) return 'Admin / Principal';
    return 'Block M';
  };

  // Compute live room status info
  const getRoomRealtimeDetails = (room: RoomRecord) => {
    const isToday = selectedDay === currentDayName;
    const isLiveOperating = isToday && currentSlotInfo.isOperating;
    const activeSlotKey = currentSlotInfo.slot;

    // Evaluate live status based on operating hours
    const currentStatus: 'Available' | 'Occupied' | 'Off Hours' = isLiveOperating 
      ? getSlotStatus(room, activeSlotKey)
      : 'Off Hours';

    let totalFree = 0;
    TIME_SLOTS.forEach(slot => {
      if (getSlotStatus(room, slot) === 'Available') totalFree++;
    });

    let nextChangeSlot: string | null = null;
    let nextChangeStatus: 'Available' | 'Occupied' | null = null;

    if (isLiveOperating && currentSlotInfo.index >= 0) {
      for (let i = currentSlotInfo.index + 1; i < TIME_SLOTS.length; i++) {
        const s = TIME_SLOTS[i];
        const st = getSlotStatus(room, s);
        if (st !== currentStatus) {
          nextChangeSlot = s;
          nextChangeStatus = st;
          break;
        }
      }
    }

    const getRoomName = (r: RoomRecord) => 
      r['Lab Room No.'] || r['Room No.'] || r['Room'] || r['room_number'] || 'Unknown Room';

    const getRoomFloor = (r: RoomRecord) => 
      r['Location / Floor'] || r['Floor'] || r['floor'] || 'Ground Floor';

    const roomName = getRoomName(room);
    const floor = getRoomFloor(room);
    const block = getBlockName(roomName);

    return {
      roomName,
      floor,
      block,
      currentStatus,
      totalFree,
      totalSlots: TIME_SLOTS.length,
      nextChangeSlot,
      nextChangeStatus,
      isLiveOperating
    };
  };

  // Extract floor list for filter dropdown
  const floorsList = useMemo(() => {
    const floors = new Set<string>();
    rooms.forEach(r => {
      const f = r['Location / Floor'] || r['Floor'] || r['floor'];
      if (f) floors.add(String(f).trim());
    });
    return Array.from(floors);
  }, [rooms]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const details = getRoomRealtimeDetails(room);

      const matchesSearch = 
        details.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        details.floor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        details.block.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFloor = 
        selectedFloor === 'all' || 
        details.floor.toLowerCase() === selectedFloor.toLowerCase();

      const matchesStatus = 
        selectedStatusFilter === 'all' ||
        (selectedStatusFilter === 'available' && details.currentStatus === 'Available') ||
        (selectedStatusFilter === 'occupied' && details.currentStatus === 'Occupied') ||
        (selectedStatusFilter === 'off_hours' && details.currentStatus === 'Off Hours');

      return matchesSearch && matchesFloor && matchesStatus;
    });
  }, [rooms, searchQuery, selectedFloor, selectedStatusFilter, currentSlotInfo, selectedDay]);

  const toggleExpandRoom = (roomKey: string) => {
    setExpandedRooms(prev => ({ ...prev, [roomKey]: !prev[roomKey] }));
  };

  // Open Navigation Map Modal
  const handleOpenNavigation = (roomName: string, floor: string) => {
    const block = getBlockName(roomName);
    setNavTargetRoom({ name: roomName, floor, block });
    setZoomLevel(100);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${currentSlotInfo.isOperating ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                {currentSlotInfo.isOperating ? 'Real-Time Classroom Monitor' : 'Campus Off-Hours'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Classroom Finder
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Live occupancy & active time slot status
            </p>
          </div>

          {/* Live Digital Clock Badge */}
          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <Clock className="w-5 h-5 text-indigo-500" />
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                Current Time
              </div>
              <div className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono">
                {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search room number (e.g. M-005, Ground Floor)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Floor Filter */}
            <div>
              <select
                value={selectedFloor}
                onChange={e => setSelectedFloor(e.target.value)}
                className="w-full py-2.5 px-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="all">All Floors</option>
                {floorsList.map(floor => (
                  <option key={floor} value={floor}>{floor}</option>
                ))}
              </select>
            </div>

            {/* Current Real-Time Status Filter */}
            <div>
              <select
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value as any)}
                className="w-full py-2.5 px-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                <option value="all">⚡ All Live Statuses</option>
                <option value="available">🟢 Available Right Now</option>
                <option value="occupied">🔴 Occupied Right Now</option>
                <option value="off_hours">🌙 Off Hours</option>
              </select>
            </div>
          </div>

          {/* Active Slot Indicator & Info */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>Showing <strong>{filteredRooms.length}</strong> of {rooms.length} rooms for <strong>{selectedDay}</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-indigo-50/70 dark:bg-indigo-950/50 px-3 py-1 rounded-lg text-indigo-700 dark:text-indigo-300 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Active Slot: <strong>{currentSlotInfo.slot}</strong> 
                {!currentSlotInfo.isOperating && ` (${currentSlotInfo.timeLabel})`}
              </span>
            </div>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="h-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse p-6">
                <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
                <div className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-xl mb-4" />
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-rose-700 dark:text-rose-300 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-base">Error loading rooms</h3>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={fetchRoomData}
              className="ml-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredRooms.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No matching rooms found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Try adjusting your search query or filter selection.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedFloor('all'); setSelectedStatusFilter('all'); }}
              className="mt-4 px-4 py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-medium text-xs rounded-xl hover:bg-indigo-100 transition"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Room Cards Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room, idx) => {
              const details = getRoomRealtimeDetails(room);
              const roomKey = String(room.id || details.roomName || idx);
              const isExpanded = !!expandedRooms[roomKey];

              return (
                <div
                  key={roomKey}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Room {details.roomName}</span>
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{details.floor} • {details.block}</span>
                      </div>
                    </div>

                    {/* Summary Badge */}
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {details.totalFree}/{details.totalSlots} Free Today
                    </span>
                  </div>

                  {/* Main Real-Time Status Block */}
                  <div className="p-5 space-y-4 flex-1">
                    
                    {/* Real-Time Status Display Banner */}
                    <div
                      className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                        details.currentStatus === 'Available'
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                          : details.currentStatus === 'Occupied'
                          ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
                          : 'bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2.5 rounded-xl ${
                            details.currentStatus === 'Available'
                              ? 'bg-emerald-500 text-white'
                              : details.currentStatus === 'Occupied'
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-500 text-white'
                          }`}
                        >
                          {details.currentStatus === 'Available' && <CheckCircle2 className="w-6 h-6" />}
                          {details.currentStatus === 'Occupied' && <XCircle className="w-6 h-6" />}
                          {details.currentStatus === 'Off Hours' && <Moon className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
                            Current Status
                          </div>
                          <div className="text-lg font-extrabold flex items-center gap-2">
                            <span>
                              {details.currentStatus === 'Available' && 'AVAILABLE NOW'}
                              {details.currentStatus === 'Occupied' && 'OCCUPIED NOW'}
                              {details.currentStatus === 'Off Hours' && 'OFF HOURS'}
                            </span>
                            {details.currentStatus === 'Available' && (
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active Time Slot Info Bar */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          Active Time Slot:
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                          {currentSlotInfo.slot}
                        </span>
                      </div>

                      {/* Next status prediction */}
                      {details.nextChangeSlot && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-700/50 pt-2 flex items-center justify-between">
                          <span>Next Status Change:</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {details.nextChangeStatus === 'Available' ? '🟢 Becomes Free at ' : '🔴 Occupied at '}
                            {details.nextChangeSlot.split('-')[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Collapsible Full Day Schedule Drawer */}
                    <div>
                      <button
                        onClick={() => toggleExpandRoom(roomKey)}
                        className="w-full text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center gap-1 py-1.5 transition"
                      >
                        <span>{isExpanded ? 'Hide Full Day Schedule' : 'View Full Day Schedule (7 Slots)'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs animate-fadeIn">
                          {TIME_SLOTS.map(slot => {
                            const status = getSlotStatus(room, slot);
                            const isCurrentSlot = slot === currentSlotInfo.slot;
                            const isSlotFree = status === 'Available';

                            return (
                              <div
                                key={slot}
                                className={`flex items-center justify-between py-1.5 px-3 rounded-lg border ${
                                  isCurrentSlot
                                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'
                                    : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'
                                }`}
                              >
                                <span className={`font-mono ${isCurrentSlot ? 'font-bold text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                                  {slot} {isCurrentSlot && '(Now)'}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    isSlotFree
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  }`}
                                >
                                  {status}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Card Navigation Trigger Button */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleOpenNavigation(details.roomName, details.floor)}
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Navigate to {details.roomName}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Campus Aerial Navigation Modal */}
      {navTargetRoom && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-hidden animate-fadeIn">
          <div className="bg-slate-900 text-white w-full max-w-5xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-4 md:p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
                  <Compass className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                    <span>Navigating to Room {navTargetRoom.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {navTargetRoom.block}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Campus aerial view & block location path
                  </p>
                </div>
              </div>

              <button
                onClick={() => setNavTargetRoom(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive Aerial Map Viewport */}
            <div className="relative flex-1 bg-slate-950 overflow-hidden min-h-[420px] flex items-center justify-center">
              
              {/* Floor Badge (Top Left) */}
              <div className="absolute top-4 left-4 z-20">
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span>{navTargetRoom.floor}</span>
                </div>
              </div>

              {/* Zoom Controls (Top Right) */}
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 25, 200))}
                  className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 25, 75))}
                  className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 transition"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Zoom Readout Badge (Bottom Left) */}
              <div className="absolute bottom-4 left-4 z-20">
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-xl text-xs font-medium shadow-md">
                  Zoom: {zoomLevel}%
                </div>
              </div>

              {/* Scalable Map Canvas */}
              <div
                className="relative w-full h-full max-w-4xl max-h-[550px] transition-transform duration-300 ease-out flex items-center justify-center p-4"
                style={{ transform: `scale(${zoomLevel / 100})` }}
              >
                {/* Campus Aerial Background Image Container */}
                <div className="relative w-full h-[400px] md:h-[480px] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden bg-slate-950">
                  
                  {/* Satellite Map Image */}
                  <img 
                    src="/images/satellite_map.png" 
                    alt="Campus Aerial Satellite Map"
                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                  />

                  {/* SVG Navigation Route Line */}
                  <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path
                      d={BLOCK_MAP_DATA[navTargetRoom.block]?.pathD || 'M 35 98 L 35 70 L 66 70'}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      className="animate-pulse"
                    />
                  </svg>

                  {/* Target Block Pin Marker */}
                  {BLOCK_MAP_DATA[navTargetRoom.block] && (
                    <div 
                      className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                      style={{
                        left: BLOCK_MAP_DATA[navTargetRoom.block].pinPos.left,
                        top: BLOCK_MAP_DATA[navTargetRoom.block].pinPos.top
                      }}
                    >
                      <div className="relative flex items-center justify-center">
                        <span className="absolute w-8 h-8 rounded-full bg-indigo-500/40 animate-ping" />
                        <div className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center shadow-lg text-white">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <span className="mt-1 px-2 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded shadow-md whitespace-nowrap">
                        {navTargetRoom.name} ({navTargetRoom.block})
                      </span>
                    </div>
                  )}

                  {/* Main Gate Entrance Marker */}
                  <div className="absolute left-[35%] top-[95%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow">
                      <Navigation className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-[9px] font-bold bg-slate-900/90 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 mt-0.5">
                      Main Gate
                    </span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}