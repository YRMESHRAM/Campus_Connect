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
  Filter,
  Sparkles
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
    // 1:00 to 5:00 belong to PM hours (13:00 to 17:00)
    if (h >= 1 && h <= 5) {
      h += 12;
    }
    return h * 60 + m;
  };

  return { start: parseMin(startStr), end: parseMin(endStr) };
};

export default function ClassroomFinder() {
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Live Time State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'available' | 'occupied'>('all');
  
  // Real-time Clock (updates every second)
  const [now, setNow] = useState<Date>(new Date());
  
  // Expandable timetable accordion per room card
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({});

  // Get current day name (default to current day or Saturday if Sunday)
  const currentDayName = useMemo(() => {
    const dayIndex = new Date().getDay(); // 0 is Sunday
    if (dayIndex === 0 || dayIndex > 6) return "Saturday";
    return DAYS_OF_WEEK[dayIndex - 1];
  }, []);

  const [selectedDay, setSelectedDay] = useState<string>(currentDayName);

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

  // Current active time slot calculation
  const currentSlotInfo = useMemo(() => {
    const currentMin = now.getHours() * 60 + now.getMinutes();

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

    const firstStart = getSlotRangeMinutes(TIME_SLOTS[0]).start;
    if (currentMin < firstStart) {
      return {
        slot: TIME_SLOTS[0],
        index: 0,
        isOperating: false,
        statusText: 'Before Class Hours',
        timeLabel: 'Classes start at 10:30 AM'
      };
    }

    return {
      slot: TIME_SLOTS[TIME_SLOTS.length - 1],
      index: TIME_SLOTS.length - 1,
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

  // Compute live room status info
  const getRoomRealtimeDetails = (room: RoomRecord) => {
    const activeSlotKey = currentSlotInfo.slot;
    const currentStatus = getSlotStatus(room, activeSlotKey);
    const isToday = selectedDay === currentDayName;

    // Count total free slots today
    let totalFree = 0;
    TIME_SLOTS.forEach(slot => {
      if (getSlotStatus(room, slot) === 'Available') totalFree++;
    });

    // Find next status change time
    let nextChangeSlot: string | null = null;
    let nextChangeStatus: 'Available' | 'Occupied' | null = null;

    for (let i = currentSlotInfo.index + 1; i < TIME_SLOTS.length; i++) {
      const s = TIME_SLOTS[i];
      const st = getSlotStatus(room, s);
      if (st !== currentStatus) {
        nextChangeSlot = s;
        nextChangeStatus = st;
        break;
      }
    }

    const getRoomName = (r: RoomRecord) => 
      r['Lab Room No.'] || r['Room No.'] || r['Room'] || r['room_number'] || 'Unknown Room';

    const getRoomFloor = (r: RoomRecord) => 
      r['Location / Floor'] || r['Floor'] || r['floor'] || 'Ground Floor';

    return {
      roomName: getRoomName(room),
      floor: getRoomFloor(room),
      currentStatus,
      totalFree,
      totalSlots: TIME_SLOTS.length,
      nextChangeSlot,
      nextChangeStatus,
      isLiveOperating: isToday && currentSlotInfo.isOperating
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

      // Search filter
      const matchesSearch = 
        details.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        details.floor.toLowerCase().includes(searchQuery.toLowerCase());

      // Floor filter
      const matchesFloor = 
        selectedFloor === 'all' || 
        details.floor.toLowerCase() === selectedFloor.toLowerCase();

      // Status filter (Available right now vs Occupied right now)
      const matchesStatus = 
        selectedStatusFilter === 'all' ||
        (selectedStatusFilter === 'available' && details.currentStatus === 'Available') ||
        (selectedStatusFilter === 'occupied' && details.currentStatus === 'Occupied');

      return matchesSearch && matchesFloor && matchesStatus;
    });
  }, [rooms, searchQuery, selectedFloor, selectedStatusFilter, currentSlotInfo, selectedDay]);

  const toggleExpandRoom = (roomKey: string) => {
    setExpandedRooms(prev => ({ ...prev, [roomKey]: !prev[roomKey] }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Real-Time Classroom Monitor
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Classroom Finder
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Live current occupancy & active slot schedule
            </p>
          </div>

          {/* Live Digital Clock Badge */}
          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <Clock className="w-5 h-5 text-indigo-500 animate-spin-slow" />
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
              <span>Current Active Time Slot: <strong>{currentSlotInfo.slot}</strong></span>
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
              const isAvailable = details.currentStatus === 'Available';

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
                        <span>{details.floor}</span>
                      </div>
                    </div>

                    {/* Summary Badge */}
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {details.totalFree}/{details.totalSlots} Free Today
                    </span>
                  </div>

                  {/* Main Real-Time Status Block */}
                  <div className="p-5 space-y-4 flex-1">
                    
                    {/* Big Real-Time Status Display */}
                    <div
                      className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                        isAvailable
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                          : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2.5 rounded-xl ${
                            isAvailable
                              ? 'bg-emerald-500 text-white'
                              : 'bg-rose-500 text-white'
                          }`}
                        >
                          {isAvailable ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : (
                            <XCircle className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
                            Current Status
                          </div>
                          <div className="text-lg font-extrabold flex items-center gap-2">
                            <span>{isAvailable ? 'AVAILABLE NOW' : 'OCCUPIED NOW'}</span>
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                isAvailable ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'
                              }`}
                            />
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

                  {/* Card Footer Button */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => alert(`Navigating to Room ${details.roomName}...`)}
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
    </div>
  );
}