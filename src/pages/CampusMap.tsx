import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  MapPin,
  Navigation,
  Maximize2,
  Minimize2,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Compass,
  Home,
  ArrowRight,
  ArrowUpDown,
  X,
  Keyboard,
  Info,
  Footprints,
  Building,
<<<<<<< HEAD
  Crosshair,
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
=======
  Search,
  Play,
  Pause,
  RotateCw,
  CheckCircle2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Share2,
  Copy,
>>>>>>> ab63062b24cbb73392c9f2baf084cffd310a70cc
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import { fetchFacultyFromSupabase, getCachedFacultyData } from '../utils/facultyStore';
import {
  gpsToCampusCoords,
  findNearestLandmark,
  GPSPosition,
} from '../utils/gpsUtils';

// ─── Types ──────────────────────────────────────────────
interface FacultyMember {
  id: string;
  name: string;
  department: string;
  cabin: string;
  block: string;
  floor: number;
}

export interface PlaceItem {
  id: string;
  name: string;
  type: 'gate' | 'entrance' | 'block' | 'classroom' | 'faculty' | 'amenity' | 'lab';
  block: string;
  floor: number;
  floorLabel: string;
  cabin?: string;
  icon?: string;
  subtitle?: string;
  key?: string;
}

// ─── Utility functions ──────────────────────────────────
function deriveBlock(cabin: string, department?: string): string {
  if (cabin) {
    const upper = cabin.toUpperCase();
    if (upper.startsWith('ADM') || upper.includes('ADMIN') || upper.includes('PRINCIPAL')) return 'ADM';
    if (upper.includes('CANTEEN')) return 'CANTEEN';
    const match = upper.match(/^([A-Z]+)/);
    if (match) return match[1];
  }
  if (department) {
    const d = department.toLowerCase();
    if (d.includes('first') || d.includes('fy') || d.includes('basic') || d.includes('humanities') || d.includes('applied')) return 'F';
    if (d.includes('cse') || d.includes('computer') || d.includes('ai') || d.includes('ml') || d.includes('data')) return 'M';
    if (d.includes('etc') || d.includes('electronics') || d.includes('telecom') || d.includes('mba') || d.includes('mca') || d.includes('bca')) return 'E';
    if (d.includes('mech') || d.includes('elect') || d.includes('civil')) return 'B';
    if (d.includes('admin') || d.includes('principal') || d.includes('office')) return 'ADM';
  }
  return 'M';
}

function deriveFloor(cabin: string): number {
  if (!cabin) return 0;
  const digits = cabin.replace(/^[A-Za-z]+/, '');
  if (digits.length >= 1) {
    const firstDigit = parseInt(digits[0], 10);
    if (!isNaN(firstDigit)) return firstDigit;
  }
  return 0;
}

function parseBlockParam(blockStr: string | null, roomStr: string | null): string {
  if (blockStr) {
    const upper = blockStr.toUpperCase().trim();
    if (upper.includes('ADM') || upper.includes('ADMIN') || upper.includes('PRINCIPAL')) return 'ADM';
    if (upper.includes('CANTEEN')) return 'CANTEEN';
    if (upper.startsWith('BLOCK ')) return upper.replace('BLOCK ', '').trim();
    if (upper.startsWith('BLOCK-')) return upper.replace('BLOCK-', '').trim();
    return upper;
  }
  return deriveBlock(roomStr || '');
}

function parseFloorParam(floorStr: string | null, roomStr: string | null): number {
  if (floorStr) {
    const lower = floorStr.toLowerCase().trim();
    if (lower.includes('ground') || lower === '0' || lower === 'g') return 0;
    if (lower.includes('1') || lower.includes('first')) return 1;
    if (lower.includes('2') || lower.includes('second')) return 2;
    if (lower.includes('3') || lower.includes('third')) return 3;
  }
  return deriveFloor(roomStr || '');
}

function toFacultyMember(raw: any, index: number): FacultyMember | null {
  const name = (raw['Faculty Name'] || raw.name || '').trim();
  if (!name || name.toLowerCase() === '(blank)' || name.toLowerCase() === 'blank' || name.toLowerCase() === 'n/a') {
    return null;
  }
  const department = (raw['Department'] || raw.department || 'General').trim();
  const rawCabin = (raw['Cabin No.'] || raw.cabin || '').trim();
  const cabin = (!rawCabin || rawCabin.toLowerCase() === '(blank)' || rawCabin === '--' || rawCabin === '-') ? '' : rawCabin;
  return {
    id: String(raw.id ?? index),
    name,
    department,
    cabin,
    block: deriveBlock(cabin, department),
    floor: deriveFloor(cabin),
  };
}

/**
 * Parse an arbitrary room code like "m001", "M213", "f105", "e202" into a PlaceItem.
 * Returns null if the string doesn't look like a valid room code.
 */
function parseRoomCode(input: string): PlaceItem | null {
  const trimmed = input.trim().toUpperCase().replace(/\s+/g, '');
  // Match patterns like M001, F105, E202, B101, ADM, etc.
  const match = trimmed.match(/^([A-Z]+)(\d{2,4})$/);
  if (!match) return null;
  const blockLetter = match[1];
  const roomNum = match[2];
  const floor = parseInt(roomNum[0], 10);
  const floorLabel = floorLabels[floor] || `${floor}th Floor`;
  const blockKey = blockLetter === 'ADM' ? 'ADM' : blockLetter;
  const blockData = blockInfo[blockKey];
  if (!blockData) return null;
  const roomId = `${blockLetter}${roomNum}`;
  return {
    id: `room-${roomId}`,
    name: `Room ${roomId}`,
    type: 'classroom',
    block: blockKey,
    floor: isNaN(floor) ? 0 : floor,
    floorLabel,
    cabin: roomId,
    icon: '🏫',
    subtitle: `${blockData.shortLabel} · ${floorLabel}`,
  };
}

function getManeuverIcon(stepText: string): string {
  if (!stepText) return '🧭';
  const lower = stepText.toLowerCase();
  if (lower.includes('arrive') || lower.includes('destination') || lower.includes('🎯')) return '🎯';
  if (lower.includes('stair') || lower.includes('stairs') || lower.includes('up') || lower.includes('down') || lower.includes('floor') || lower.includes('🪜')) return '🪜';
  if (lower.includes('left') || lower.includes('↩️')) return '↩️';
  if (lower.includes('right') || lower.includes('↪️')) return '↪️';
  if (lower.includes('walk') || lower.includes('forward') || lower.includes('corridor') || lower.includes('path') || lower.includes('along')) return '⬆️';
  return '🧭';
}

// ─── Constants ──────────────────────────────────────────
const blockInfo: Record<string, { label: string; shortLabel: string; color: string; gradient: string; icon: string }> = {
  M: { label: 'Block M – CSE / AIML / DS / IT', shortLabel: 'Block M', color: '#84cc16', gradient: 'from-lime-500 to-emerald-600', icon: '💻' },
  F: { label: 'Block F – First Year', shortLabel: 'Block F', color: '#16a34a', gradient: 'from-green-500 to-green-700', icon: '🎓' },
  ADM: { label: 'Admin Block – Principal Office', shortLabel: 'Admin', color: '#eab308', gradient: 'from-amber-400 to-yellow-600', icon: '🏛️' },
  E: { label: 'Block E – ETC / MBA / BCA / MCA', shortLabel: 'Block E', color: '#3b82f6', gradient: 'from-blue-500 to-blue-700', icon: '📡' },
  B: { label: 'Block B – Mechanical / Electrical', shortLabel: 'Block B', color: '#f97316', gradient: 'from-orange-500 to-orange-700', icon: '⚙️' },
  CANTEEN: { label: 'Campus Canteen & Snacks', shortLabel: 'Canteen', color: '#ef4444', gradient: 'from-red-500 to-rose-600', icon: '🍽️' },
};

const floorLabels = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'];

// Standard Known Places — all blocks, rooms, labs, amenities
const standardPlaces: PlaceItem[] = [
  // Entrances / Gates
  { id: 'ENTRANCE_F', key: 'ENTRANCE_F', name: 'Entrance (F004-F005)', type: 'entrance', block: 'F', floor: 0, floorLabel: 'Ground Floor', icon: '🚪', subtitle: 'Main First Year Wing Entrance' },
  { id: 'MAIN_GATE', key: 'MAIN_GATE', name: 'Main Campus Gate', type: 'gate', block: 'GROUND', floor: 0, floorLabel: 'Ground Floor', icon: '🚩', subtitle: 'Campus Entry & Guard Post' },
  { id: 'PARKING', key: 'PARKING', name: 'Parking Area A', type: 'gate', block: 'GROUND', floor: 0, floorLabel: 'Ground Floor', icon: '🅿️', subtitle: 'Two & Four Wheeler Parking' },
  { id: 'ADM', key: 'ADM', name: 'Admin Block Entrance', type: 'entrance', block: 'ADM', floor: 0, floorLabel: 'Ground Floor', icon: '🏛️', subtitle: 'Principal Office & Accounts' },
  { id: 'BLOCK_E', key: 'BLOCK_E', name: 'Block E Entrance', type: 'entrance', block: 'E', floor: 0, floorLabel: 'Ground Floor', icon: '📡', subtitle: 'ETC / MCA Wing Entrance' },
  { id: 'BLOCK_B', key: 'BLOCK_B', name: 'Block B Entrance', type: 'entrance', block: 'B', floor: 0, floorLabel: 'Ground Floor', icon: '⚙️', subtitle: 'Mechanical Wing & Stage' },
  { id: 'BLOCK_M', key: 'BLOCK_M', name: 'Block M Entrance', type: 'entrance', block: 'M', floor: 0, floorLabel: 'Ground Floor', icon: '💻', subtitle: 'CSE / AIML Dept Entrance' },
  { id: 'CANTEEN', key: 'CANTEEN', name: 'Campus Canteen', type: 'amenity', block: 'CANTEEN', floor: 0, floorLabel: 'Ground Floor', icon: '🍽️', subtitle: 'Food Court & Refreshments' },

  // Emergency & Administrative Services
  { id: 'security', key: 'MAIN_GATE', name: 'Security Office (Main Gate)', type: 'amenity', block: 'GROUND', floor: 0, floorLabel: 'Ground Floor', icon: '🛡️', subtitle: 'Campus Security, 24/7 Guard Post', cabin: 'MAIN_GATE' },
  { id: 'medical', key: 'room-F004', name: 'Medical Room (Block F)', type: 'amenity', block: 'F', floor: 0, floorLabel: 'Ground Floor', icon: '❤️', subtitle: 'First Aid & Healthcare Clinic', cabin: 'F004' },
  { id: 'reception', key: 'ADM', name: 'Reception / Helpdesk', type: 'amenity', block: 'ADM', floor: 0, floorLabel: 'Ground Floor', icon: '📞', subtitle: 'Visitor Helpdesk & Inquiries', cabin: 'ADM' },
  { id: 'fire', key: 'MAIN_GATE', name: 'Fire Safety HQ', type: 'amenity', block: 'GROUND', floor: 0, floorLabel: 'Ground Floor', icon: '🔥', subtitle: 'Fire Emergency Response & Station', cabin: 'MAIN_GATE' },
  { id: 'admin-office', key: 'ADM', name: 'Administration Office', type: 'amenity', block: 'ADM', floor: 1, floorLabel: '1st Floor', icon: '🏛️', subtitle: 'Academic Administration & Records', cabin: 'ADM' },

  // Key Academic Destinations
  { id: 'library', name: 'Central Library (F203)', type: 'amenity', block: 'F', floor: 2, floorLabel: '2nd Floor', icon: '📖', subtitle: 'Main Books, Reading Hall & Digital Library', cabin: 'F203' },
  { id: 'auditorium', name: 'Auditorium M008', type: 'amenity', block: 'M', floor: 0, floorLabel: 'Ground Floor', icon: '🏛️', subtitle: 'Main Academic Auditorium (Ground)', cabin: 'M008' },
  { id: 'exam-center', name: 'Exam Center (E202)', type: 'amenity', block: 'E', floor: 2, floorLabel: '2nd Floor', icon: '📝', subtitle: 'University Exam Control Cell', cabin: 'E202' },
  { id: 'seminar-hall', name: 'Central Seminar Hall', type: 'amenity', block: 'M', floor: 3, floorLabel: '3rd Floor', icon: '🎙️', subtitle: 'Conferences & Major Events' },
  { id: 'seminar-hall-etc', name: 'Seminar Hall (ETC)', type: 'amenity', block: 'E', floor: 3, floorLabel: '3rd Floor', icon: '🎙️', subtitle: 'Electronics Dept Seminar Hall' },
  { id: 'dept-library', name: 'Dept Library (CSE)', type: 'amenity', block: 'M', floor: 2, floorLabel: '2nd Floor', icon: '📚', subtitle: 'Computer Science Reference Section' },
  { id: 'stage', name: 'Main Stage & Amphitheatre', type: 'amenity', block: 'B', floor: 0, floorLabel: 'Ground Floor', icon: '🎭', subtitle: 'Cultural Events & Open Ground Stage' },
  { id: 'computer-lab', name: 'Central Computer Lab', type: 'lab', block: 'E', floor: 0, floorLabel: 'Ground Floor', icon: '💻', subtitle: 'Ground Floor High-Speed Lab' },
  { id: 'mca-lab', name: 'MCA Computer Lab', type: 'lab', block: 'E', floor: 1, floorLabel: '1st Floor', icon: '🖥️', subtitle: 'Post-Graduation Lab' },
  { id: 'cad-2', name: 'CAD Lab 2', type: 'lab', block: 'M', floor: 1, floorLabel: '1st Floor', icon: '🖥️', subtitle: 'Design & Graphics Simulation Lab' },
  { id: 'project-lab', name: 'Mechanical Project Lab', type: 'lab', block: 'B', floor: 0, floorLabel: 'Ground Floor', icon: '⚙️', subtitle: 'Fabrication & Prototyping Workshop' },
  { id: 'room-E005', name: 'Robotics & IoT Lab (E005)', type: 'lab', block: 'E', floor: 0, floorLabel: 'Ground Floor', icon: '🤖', subtitle: 'Advanced Robotics Lab', cabin: 'E005' },
  { id: 'room-M303', name: 'Emerging Tech Lab (M303)', type: 'lab', block: 'M', floor: 3, floorLabel: '3rd Floor', icon: '⚡', subtitle: 'AI & Cloud Computing Lab', cabin: 'M303' },
  { id: 'room-F001', name: 'Physics Lab (F001)', type: 'lab', block: 'F', floor: 0, floorLabel: 'Ground Floor', icon: '🔬', subtitle: '1st Year Applied Physics Lab', cabin: 'F001' },
  { id: 'room-F002', name: 'Chemistry Lab (F002)', type: 'lab', block: 'F', floor: 0, floorLabel: 'Ground Floor', icon: '🧪', subtitle: '1st Year Applied Chemistry Lab', cabin: 'F002' },

  // HOD Offices
  { id: 'room-M108', name: 'HOD CSE Office (M108)', type: 'classroom', block: 'M', floor: 1, floorLabel: '1st Floor', icon: '👨‍💼', subtitle: 'Computer Science Head Office', cabin: 'M108' },
  { id: 'room-M208', name: 'HOD AIML Office (M208)', type: 'classroom', block: 'M', floor: 2, floorLabel: '2nd Floor', icon: '👨‍💼', subtitle: 'AI & Machine Learning Head Office', cabin: 'M208' },
  { id: 'room-E010', name: 'HOD ETC Office (E010)', type: 'classroom', block: 'E', floor: 0, floorLabel: 'Ground Floor', icon: '👨‍💼', subtitle: 'Electronics Dept Head Office', cabin: 'E010' },
  { id: 'room-E103', name: 'HOD MBA Office (E103)', type: 'classroom', block: 'E', floor: 1, floorLabel: '1st Floor', icon: '👨‍💼', subtitle: 'Management Studies Head Office', cabin: 'E103' },
  { id: 'room-B002', name: 'HOD Mech Office (B002)', type: 'classroom', block: 'B', floor: 0, floorLabel: 'Ground Floor', icon: '👨‍💼', subtitle: 'Mechanical Engineering Head Office', cabin: 'B002' },
  { id: 'room-B103', name: 'HOD Electrical Office (B103)', type: 'classroom', block: 'B', floor: 1, floorLabel: '1st Floor', icon: '👨‍💼', subtitle: 'Electrical Engineering Head Office', cabin: 'B103' },

  // Popular Classrooms & Faculty Rooms
  { id: 'room-M203', name: 'Faculty Room M203', type: 'faculty', block: 'M', floor: 2, floorLabel: '2nd Floor', icon: '👤', subtitle: 'CSE & AIML Faculty Room (Between M202 & M204)', cabin: 'M203' },
  { id: 'room-M202', name: 'Classroom M202', type: 'classroom', block: 'M', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'AIML 2nd Floor', cabin: 'M202' },
  { id: 'room-M001', name: 'Classroom M001', type: 'classroom', block: 'M', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'CSE Ground Floor Lab', cabin: 'M001' },
  { id: 'room-M213', name: 'Classroom M213', type: 'classroom', block: 'M', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'AIML Lecture Hall', cabin: 'M213' },
  { id: 'room-F004', name: 'Classroom F004', type: 'classroom', block: 'F', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'First Year Section A', cabin: 'F004' },
  { id: 'room-F105', name: 'Classroom F105', type: 'classroom', block: 'F', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'First Year Section B', cabin: 'F105' },
  { id: 'room-F201', name: 'Classroom F201', type: 'classroom', block: 'F', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'First Year Section C', cabin: 'F201' },
  { id: 'room-M101', name: 'Classroom M101', type: 'classroom', block: 'M', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'CSE 2nd Year Lecture Hall', cabin: 'M101' },
  { id: 'room-M201', name: 'Classroom M201', type: 'classroom', block: 'M', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'AIML 3rd Year Lecture Hall', cabin: 'M201' },
  { id: 'room-M301', name: 'Classroom M301', type: 'classroom', block: 'M', floor: 3, floorLabel: '3rd Floor', icon: '🎓', subtitle: 'Final Year CSE Lecture Hall', cabin: 'M301' },
  { id: 'room-E101', name: 'Classroom E101', type: 'classroom', block: 'E', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'ETC Dept Lecture Hall', cabin: 'E101' },
  { id: 'room-B101', name: 'Classroom B101', type: 'classroom', block: 'B', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Mechanical Dept Lecture Hall', cabin: 'B101' },
];

function generateFallbackSteps(from: PlaceItem, to: PlaceItem): string[] {
  const fromFl = from.floorLabel || `${from.floor}th Floor`;
  const toFl = to.floorLabel || `${to.floor}th Floor`;
  const fromKey = `${from.block}${from.floor}`;
  const toKey = `${to.block}${to.floor}`;
  const routeKey = `${fromKey}_${toKey}`;
  const toUpper = (to.cabin || to.name || '').toUpperCase();

  type RouteSteps = string[];
  const knownRoutes: Record<string, RouteSteps> = {
    // F Ground → M 2nd Floor (Entrance -> Block M 2nd Floor / Faculty / Classrooms)
    'F0_M2': [
      `Start at ${from.name} (${fromFl}, Block F)`,
      `🚶 Walk forward from entrance along the main corridor`,
      `↩️ Take first Left turn at the junction towards Block M`,
      `🚶 Walk across the courtyard walkway into Block M`,
      `⬆️ Then go through stairs UP to 2nd Floor (Block M)`,
      `↪️ Go Right / Turn Right into the 2nd Floor hallway`,
      `🚶 Walk along the hallway past M201 & M202`,
    ],
    // F Ground → M 1st Floor
    'F0_M1': [
      `Start at ${from.name} (${fromFl}, Block F)`,
      `🚶 Walk forward from entrance along the main corridor`,
      `↩️ Take first Left turn at the junction towards Block M`,
      `🚶 Walk across the courtyard walkway into Block M`,
      `⬆️ Then go through stairs UP to 1st Floor (Block M)`,
      `↪️ Go Right / Turn Right into the 1st Floor hallway`,
    ],
    // F Ground → M Ground
    'F0_M0': [
      `Start at ${from.name} (${fromFl}, Block F)`,
      `🚶 Walk forward from entrance along the main corridor`,
      `↩️ Take first Left turn at the junction towards Block M`,
      `🚶 Walk across the courtyard walkway straight into Block M Ground Floor`,
    ],
    // F Ground → E Ground
    'F0_E0': [
      `Start at ${from.name} (${fromFl}, Block F)`,
      `🚶 Walk forward from entrance along the main corridor`,
      `↪️ Take first Right turn at the junction towards Block E`,
      `🚶 Walk along the connecting pathway into Block E`,
    ],
    // F Ground → E 1st Floor
    'F0_E1': [
      `Start at ${from.name} (${fromFl}, Block F)`,
      `🚶 Walk forward from entrance along the main corridor`,
      `↪️ Take first Right turn at the junction towards Block E`,
      `🚶 Walk along the connecting pathway into Block E`,
      `⬆️ Then go through stairs UP to 1st Floor (Block E)`,
      `↩️ Take Left turn into the 1st Floor corridor`,
    ],
    // M 2nd → same block
    'M2_M2': [
      `Start at ${from.name} (2nd Floor, Block M)`,
      `🚶 Walk along the 2nd Floor Block M corridor`,
    ],
    // M 1st → M 2nd
    'M1_M2': [
      `Start at ${from.name} (1st Floor, Block M)`,
      `🚶 Walk along the 1st Floor corridor to the staircase`,
      `⬆️ Then go through stairs UP to 2nd Floor`,
      `↪️ Go Right into the 2nd Floor hallway`,
    ],
    // M Ground → M 2nd
    'M0_M2': [
      `Start at ${from.name} (Ground Floor, Block M)`,
      `🚶 Walk through the Ground Floor Block M corridor to the staircase`,
      `⬆️ Then go through stairs UP to 2nd Floor`,
      `↪️ Go Right into the 2nd Floor hallway`,
      `🚶 Walk along the 2nd Floor corridor`,
    ],
    // M 2nd → M Ground
    'M2_M0': [
      `Start at ${from.name} (2nd Floor, Block M)`,
      `🚶 Walk along the 2nd Floor corridor to the staircase`,
      `⬇️ Then go through stairs DOWN to Ground Floor`,
      `↪️ Go Right into the Ground Floor corridor`,
    ],
    // M 2nd → F Ground
    'M2_F0': [
      `Start at ${from.name} (2nd Floor, Block M)`,
      `🚶 Walk to the Block M staircase`,
      `⬇️ Then go through stairs DOWN to Ground Floor`,
      `🚶 Walk through the Ground Floor corridor`,
      `↪️ Take Right turn towards Block F`,
      `🚶 Walk along the connecting walkway into Block F`,
    ],
  };

  const steps: string[] = knownRoutes[routeKey]
    ? [...knownRoutes[routeKey]]
    : (() => {
        const s: string[] = [];
        s.push(`Start at ${from.name} (${fromFl}, Block ${from.block})`);
        if (from.block === 'F' && from.floor === 0) {
          s.push(`🚶 Walk forward from entrance along the hallway`);
          if (to.block === 'M') {
            s.push(`↩️ Take first Left turn at the junction towards Block M`);
            s.push(`🚶 Walk across the courtyard walkway into Block M`);
          } else if (to.block === 'E') {
            s.push(`↪️ Take first Right turn at the junction towards Block E`);
          }
        } else if (from.block === to.block) {
          s.push(`🚶 Walk along the ${fromFl} corridor`);
        } else {
          s.push(`🚶 Walk along the ${fromFl} corridor towards the connecting walkway`);
          s.push(`🚶 Follow the connecting path to Block ${to.block}`);
        }
        if (from.floor < to.floor) {
          s.push(`⬆️ Then go through stairs UP to ${toFl} (Block ${to.block})`);
          s.push(`↪️ Go Right / Turn into the ${toFl} corridor`);
        } else if (from.floor > to.floor) {
          s.push(`⬇️ Then go through stairs DOWN to ${toFl} (Block ${to.block})`);
          s.push(`↩️ Go Left / Turn into the ${toFl} corridor`);
        }
        return s;
      })();

  // Room-specific final approach
  if (toUpper.includes('M203') || toUpper.includes('FACULTY M203') || toUpper.includes('SWATI')) {
    steps.push(`🚶 Faculty Room M203 is on your right between M202 & M204`);
  } else if (toUpper.includes('M202')) {
    steps.push(`🚶 M202 is on your right after M201`);
  } else if (toUpper.includes('M201')) {
    steps.push(`🚶 M201 is the first room on your right in the 2nd Floor hallway`);
  } else if (toUpper.includes('M204')) {
    steps.push(`🚶 Walk past M201, M202, M203 — Faculty M204 is on your right`);
  } else if (toUpper.includes('M208') || toUpper.includes('HOD AIML')) {
    steps.push(`🚶 Walk to the far end of the 2nd Floor corridor — HOD Office M208 is on the left`);
  } else if (toUpper.includes('LIBRARY') || toUpper.includes('DEPT LIBRARY')) {
    steps.push(`🚶 Walk straight along the 2nd Floor corridor — CSE Dept Library is on your left`);
  } else if (toUpper.includes('M213')) {
    steps.push(`🚶 Walk to the end of the left-side corridor — M213 is at the far end`);
  } else if (toUpper.includes('EXAM') || toUpper.includes('EXAM CENTER')) {
    steps.push(`🚶 Walk to the far end of Block E — the Exam Center is at the end of the ground floor`);
  }

  steps.push(`🎯 Arrive at ${to.name} (${toFl}, Block ${to.block})`);
  return steps;
}

// ─── Main Component ─────────────────────────────────────
const CampusMap: React.FC = () => {
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // ── Default starting point is Entrance F (standardPlaces[0]) until user changes it ──
  const defaultStartPlace = standardPlaces[0];
  const [fromPlace, setFromPlace] = useState<PlaceItem | null>(defaultStartPlace);
  const [toPlace, setToPlace] = useState<PlaceItem | null>(null);

  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);
  const [fromCategoryFilter, setFromCategoryFilter] = useState<'all' | 'entrance' | 'classroom' | 'faculty' | 'amenity'>('all');
  const [toCategoryFilter, setToCategoryFilter] = useState<'all' | 'entrance' | 'classroom' | 'faculty' | 'amenity'>('all');

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [facultyList, setFacultyList] = useState<FacultyMember[]>([]);
  const [facultySearchQuery, setFacultySearchQuery] = useState('');
  const [facultyDeptFilter, setFacultyDeptFilter] = useState('All');
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Dynamic department list for quick filtering
  const facultyDepartments = useMemo(() => {
    const depts = new Set<string>();
    facultyList.forEach((f) => {
      if (f.department && f.department.trim()) {
        depts.add(f.department.trim());
      }
    });
    return ['All', ...Array.from(depts)];
  }, [facultyList]);

  // Filtered faculty list with real-time search & department filter
  const filteredFaculty = useMemo(() => {
    let list = facultyList;
    if (facultyDeptFilter !== 'All') {
      list = list.filter((f) => f.department.toLowerCase() === facultyDeptFilter.toLowerCase());
    }
    if (facultySearchQuery.trim()) {
      const q = facultySearchQuery.toLowerCase().trim();
      list = list.filter((f) =>
        f.name.toLowerCase().includes(q) ||
        f.department.toLowerCase().includes(q) ||
        (f.cabin && f.cabin.toLowerCase().includes(q)) ||
        f.block.toLowerCase().includes(q)
      );
    }
    return list;
  }, [facultyList, facultyDeptFilter, facultySearchQuery]);

  // Whether we are actively navigating (both From and Where selected)
  const isNavigating = fromPlace !== null && toPlace !== null;

  // Route metrics from 3D Engine
  const [routeStats, setRouteStats] = useState<{
    distanceMeters: number;
    estimatedMinutes: number;
    steps: string[];
  } | null>(null);

<<<<<<< HEAD
  // ─── Live GPS Geolocation State ───────────────────────
  const [gpsPosition, setGpsPosition] = useState<GPSPosition | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'acquiring' | 'active' | 'denied' | 'error' | 'simulated'>('idle');
  const [gpsErrorMessage, setGpsErrorMessage] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const simTimerRef = useRef<any>(null);

  // Send GPS Position to 3D Iframe
  const sendGpsToIframe = useCallback((pos: GPSPosition) => {
    const coords = gpsToCampusCoords(pos.lat, pos.lng);
    try {
      iframeRef.current?.contentWindow?.postMessage({
        type: 'UPDATE_GPS_POSITION',
        lat: pos.lat,
        lng: pos.lng,
        accuracy: pos.accuracy,
        x: coords.x,
        z: coords.z
      }, '*');
    } catch (_) { }
  }, []);

  // Update From location when GPS updates
  const updateFromPlaceWithGps = useCallback((pos: GPSPosition, isSimulated = false) => {
    const nearest = findNearestLandmark(pos.lat, pos.lng);

    const livePlace: PlaceItem = {
      id: 'LIVE_GPS',
      key: nearest.landmark.id,
      name: isSimulated ? '🔵 Simulated GPS Walking' : '🔵 Live GPS (Laptop Location)',
      type: 'gate',
      block: nearest.landmark.block,
      floor: nearest.landmark.floor,
      floorLabel: 'Ground Floor',
      icon: '🔵',
      subtitle: `${pos.lat.toFixed(5)}°N, ${pos.lng.toFixed(5)}°E · Near ${nearest.landmark.name}`
    };

    setFromPlace(livePlace);
    sendGpsToIframe(pos);
  }, [sendGpsToIframe]);

  // Start Real Browser Geolocation Watch Position
  const startGpsTracking = useCallback(() => {
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }

    if (!('geolocation' in navigator)) {
      setGpsStatus('error');
      setGpsErrorMessage('Geolocation is not supported by your browser. Defaulting to Entrance F.');
      const entranceF = standardPlaces.find(p => p.id === 'ENTRANCE_F') || standardPlaces[0];
      setFromPlace(entranceF);
      return;
    }

    setGpsStatus('acquiring');
    setGpsErrorMessage(null);

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const currentPos: GPSPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy || 10),
          altitude: pos.coords.altitude,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp
        };
        setGpsPosition(currentPos);
        setGpsStatus('active');
        updateFromPlaceWithGps(currentPos, false);
      },
      (err) => {
        console.warn('GPS Error:', err.message);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsStatus('denied');
          setGpsErrorMessage('Location permission denied. Defaulting to Main Entrance.');
        } else {
          setGpsStatus('error');
          setGpsErrorMessage(err.message || 'Unable to retrieve GPS location. Defaulting to Main Entrance.');
        }
        // Fallback to provided entrance point when live location is unavailable
        setFromPlace((prevFrom) => {
          if (!prevFrom || prevFrom.id === 'LIVE_GPS') {
            return standardPlaces.find(p => p.id === 'ENTRANCE_F') || standardPlaces[0];
          }
          return prevFrom;
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    watchIdRef.current = id;
  }, [updateFromPlaceWithGps]);

  // Stop GPS Tracking
  const stopGpsTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
    setGpsStatus('idle');
    setGpsPosition(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, []);

  // Attempt to use Live GPS location by default on load; fall back to entrance point if unavailable
  useEffect(() => {
    startGpsTracking();
  }, [startGpsTracking]);

  // Simulated GPS Walk across campus for testing indoors
  const startSimulatedWalk = useCallback(() => {
    stopGpsTracking();
    setGpsStatus('simulated');
    setGpsErrorMessage(null);

    const waypoints = [
      { lat: 21.23200, lng: 79.03010 },
      { lat: 21.23230, lng: 79.03048 },
      { lat: 21.23245, lng: 79.03060 },
      { lat: 21.23260, lng: 79.03040 },
      { lat: 21.23270, lng: 79.03075 },
    ];

    let stepIndex = 0;
    const updateSimStep = () => {
      const wp = waypoints[stepIndex % waypoints.length];
      const simPos: GPSPosition = {
        lat: wp.lat + (Math.random() - 0.5) * 0.00003,
        lng: wp.lng + (Math.random() - 0.5) * 0.00003,
        accuracy: 4,
        timestamp: Date.now()
      };
      setGpsPosition(simPos);
      updateFromPlaceWithGps(simPos, true);
      stepIndex++;
    };

    updateSimStep();
    simTimerRef.current = setInterval(updateSimStep, 2500);
  }, [stopGpsTracking, updateFromPlaceWithGps]);
=======
  // ─── Real-Time Live Navigation State ─────────────────
  const [isLiveNavigating, setIsLiveNavigating] = useState(false);
  const [liveNavProgress, setLiveNavProgress] = useState(0);
  const [liveStepIndex, setLiveStepIndex] = useState(0);
  const [distanceRemaining, setDistanceRemaining] = useState<number | null>(null);
  const [navSpeed, setNavSpeed] = useState<1 | 2>(1);
  const [followCamera, setFollowCamera] = useState(true);
  const [hasArrived, setHasArrived] = useState(false);
  const [isSignCollapsed, setIsSignCollapsed] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
>>>>>>> ab63062b24cbb73392c9f2baf084cffd310a70cc

  // ─── Data loading ───────────────────────────────────
  useEffect(() => {
    async function loadFaculty() {
      const data = await fetchFacultyFromSupabase();
      if (data && data.length > 0) {
        const parsed = data.map(toFacultyMember).filter((f): f is FacultyMember => f !== null);
        setFacultyList(parsed);
      }
    }
    const cached = getCachedFacultyData();
    if (cached && cached.length > 0) {
      const parsed = cached.map(toFacultyMember).filter((f): f is FacultyMember => f !== null);
      setFacultyList(parsed);
    }
    loadFaculty();
  }, []);

  // ─── Combine Places & Faculty for Search Autocomplete ─
  const allPlaces = useMemo(() => {
    const facultyAsPlaces: PlaceItem[] = facultyList.map((f) => ({
      id: `fac-${f.id}`,
      name: f.name,
      type: 'faculty' as const,
      block: f.block,
      floor: f.floor,
      floorLabel: floorLabels[f.floor] || `${f.floor}th Floor`,
      cabin: f.cabin,
      icon: '👤',
      subtitle: `${f.department} · Cabin ${f.cabin}`
    }));
    return [...standardPlaces, ...facultyAsPlaces];
  }, [facultyList]);

  // ─── Filtered lists for dropdowns (both identical — user can pick any place for From or Where) ─
  function filterPlaces(query: string, categoryFilter: string) {
    let list = allPlaces;
    if (categoryFilter === 'entrance') list = list.filter(p => p.type === 'entrance' || p.type === 'gate');
    else if (categoryFilter === 'classroom') list = list.filter(p => p.type === 'classroom');
    else if (categoryFilter === 'faculty') list = list.filter(p => p.type === 'faculty');
    else if (categoryFilter === 'amenity') list = list.filter(p => p.type === 'amenity' || p.type === 'lab');

    if (!query.trim()) return list.slice(0, 12);
    const q = query.toLowerCase();
    const results = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
      p.block.toLowerCase().includes(q) ||
      (p.cabin && p.cabin.toLowerCase().includes(q)) ||
      p.id.toLowerCase().includes(q)
    ).slice(0, 12);

    // If user typed a room code like m001 that isn't in the list, auto-generate it
    if (results.length === 0) {
      const parsed = parseRoomCode(query);
      if (parsed) return [parsed];
    }
    return results;
  }

  const filteredFromOptions = useMemo(() => filterPlaces(fromQuery, fromCategoryFilter), [fromQuery, fromCategoryFilter, allPlaces]);
  const filteredToOptions = useMemo(() => filterPlaces(toQuery, toCategoryFilter), [toQuery, toCategoryFilter, allPlaces]);

<<<<<<< HEAD
  // Arrival alert state
  const [isArrived, setIsArrived] = useState(false);
  const [arrivedDestination, setArrivedDestination] = useState<string | null>(null);

  // ─── Listen for 3D iframe route stats & arrival events ─────
=======
  // ─── Voice Speech Synthesis Helper ──────────────────────────────────
  const speakInstruction = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu, '')
        .replace(/[↩️↪️⬆️⬇️🚶🪜🎯🚩🚪🏛️💻📡⚙️🍽️📖🎙️⚡🔬🧪👤📍]/g, '')
        .trim();
      if (!cleanText) return;
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (_) {}
  }, []);

  // ─── Share Route Direct Link ─────────────────────────────────────────
  const handleShareRoute = useCallback(() => {
    if (!toPlace) return;
    const origin = window.location.origin;
    const path = window.location.pathname;
    const params = new URLSearchParams();
    if (fromPlace) params.set('from', fromPlace.key || fromPlace.cabin || fromPlace.id);
    if (toPlace.cabin) params.set('cabin', toPlace.cabin);
    else if (toPlace.id) params.set('to', toPlace.id);
    if (toPlace.name) params.set('name', toPlace.name);
    if (toPlace.block) params.set('block', toPlace.block);
    if (toPlace.floor !== undefined) params.set('floor', String(toPlace.floor));

    const fullUrl = `${origin}${path}?${params.toString()}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        setToastMessage('Route link copied to clipboard!');
        setTimeout(() => setToastMessage(null), 3000);
      });
    } else {
      setToastMessage('Route link: ' + fullUrl);
      setTimeout(() => setToastMessage(null), 5000);
    }
  }, [fromPlace, toPlace]);

  // ─── Listen for 3D iframe route stats & live nav updates ─────────────
>>>>>>> ab63062b24cbb73392c9f2baf084cffd310a70cc
  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === 'ROUTE_CALCULATED') {
        const fallback = fromPlace && toPlace ? generateFallbackSteps(fromPlace, toPlace) : [
          `Walk from ${fromPlace?.name || 'Start'}`,
          `Follow the glowing green corridor pathway`,
          `Arrive at destination: ${toPlace?.name || 'Destination'}`
        ];
        const steps = e.data.steps && e.data.steps.length > 0 ? e.data.steps : fallback;
        setRouteStats({
          distanceMeters: e.data.distanceMeters || 0,
          estimatedMinutes: e.data.estimatedMinutes || 1,
          steps,
        });
<<<<<<< HEAD
      } else if (e.data?.type === 'DESTINATION_ARRIVED') {
        setIsArrived(true);
        setArrivedDestination(e.data.destination || toPlace?.name || 'Destination');
=======
        setDistanceRemaining(e.data.distanceMeters || 100);
        setLiveNavProgress(0);
        setLiveStepIndex(0);
        setIsLiveNavigating(false);
        setHasArrived(false);
        if (isVoiceEnabled && steps[0]) {
          speakInstruction(steps[0]);
        }
      } else if (e.data?.type === 'LIVE_NAV_UPDATE') {
        setLiveNavProgress(e.data.progress || 0);
        if (e.data.currentStepIndex !== undefined) {
          const nextIdx = e.data.currentStepIndex;
          setLiveStepIndex(prev => {
            if (prev !== nextIdx && isVoiceEnabled && routeStats?.steps?.[nextIdx]) {
              speakInstruction(routeStats.steps[nextIdx]);
            }
            return nextIdx;
          });
        }
        if (e.data.distanceRemainingMeters !== undefined) {
          setDistanceRemaining(e.data.distanceRemainingMeters);
        }
        if (e.data.isFinished) {
          setIsLiveNavigating(false);
          setHasArrived(true);
          if (isVoiceEnabled) {
            speakInstruction('You have arrived at your destination.');
          }
        }
>>>>>>> ab63062b24cbb73392c9f2baf084cffd310a70cc
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, [fromPlace, toPlace, isVoiceEnabled, routeStats, speakInstruction]);

  // ─── Sync Theme to 3D Map iframe ───────────────────
  useEffect(() => {
    try {
      iframeRef.current?.contentWindow?.postMessage({
        type: 'SET_THEME',
        isDark: isDark,
        theme: isDark ? 'dark' : 'light'
      }, '*');
    } catch (_) { }
  }, [isDark]);

  // ─── Send Navigation Route to 3D Iframe ────────────
  const sendRouteToIframe = useCallback((from: PlaceItem, to: PlaceItem) => {
    try {
      iframeRef.current?.contentWindow?.postMessage({
        type: 'NAVIGATE_ROUTE',
        from: {
          id: from.id,
          key: from.key || from.id,
          name: from.name,
          block: from.block,
          floor: from.floor
        },
        to: {
          id: to.id,
          name: to.name,
          cabin: to.cabin || to.id,
          block: to.block,
          floor: to.floor
        },
        block: to.block,
        floor: to.floor,
        startLocation: from.key || from.cabin || from.id,
        sourceBlock: from.block
      }, '*');
    } catch (_) { }
  }, []);

  // ─── Send RESET_VIEW to show full campus (no route) ─
  const sendResetToIframe = useCallback(() => {
    try {
      iframeRef.current?.contentWindow?.postMessage({ type: 'RESET_VIEW' }, '*');
    } catch (_) { }
  }, []);

  // ─── Trigger navigation ONLY when both From and Where are set ─
  useEffect(() => {
    if (!iframeLoaded) return;
    if (fromPlace && toPlace) {
      sendRouteToIframe(fromPlace, toPlace);
    } else {
      // One or both are null → show the full campus
      sendResetToIframe();
    }
  }, [fromPlace, toPlace, iframeLoaded, sendRouteToIframe, sendResetToIframe]);

  // ─── Handle URL query params (deep-linking) ───────────────────────
  useEffect(() => {
    const toParam = searchParams.get('to') || searchParams.get('room') || searchParams.get('cabin') || searchParams.get('dest');
    const fromParam = searchParams.get('from') || searchParams.get('start') || searchParams.get('source');
    const nameParam = searchParams.get('name');
    const blockParam = searchParams.get('block');
    const floorParam = searchParams.get('floor');

    if (toParam) {
      const q = toParam.trim().toLowerCase();
      const matchedTo = allPlaces.find(p =>
        p.id.toLowerCase() === q ||
        (p.key && p.key.toLowerCase() === q) ||
        (p.cabin && p.cabin.toLowerCase() === q) ||
        p.name.toLowerCase() === q ||
        (nameParam && p.name.toLowerCase() === nameParam.toLowerCase())
      );

<<<<<<< HEAD
      const customTo: PlaceItem = {
        id: targetRoomName,
        name: displayName,
        type: 'classroom',
        block: block,
        floor: floor,
        floorLabel: floorName,
        cabin: targetRoomName,
        icon: '📍',
        subtitle: `${blockInfo[block]?.shortLabel || 'Block ' + block} · ${floorName}`
      };
      setToPlace(customTo);

      // Default starting point to Entrance (F004-F005) when navigating from classroom/faculty finder
      const entranceF = standardPlaces.find(p => p.id === 'ENTRANCE_F') || standardPlaces[0];
      setFromPlace(entranceF);
=======
      if (matchedTo) {
        setToPlace(matchedTo);
      } else {
        const parsed = parseRoomCode(toParam);
        if (parsed) {
          if (nameParam) parsed.name = nameParam;
          setToPlace(parsed);
        } else {
          const block = parseBlockParam(blockParam, toParam);
          const floor = parseFloorParam(floorParam, toParam);
          const displayName = nameParam || `Room ${toParam}`;
          const floorName = floorLabels[floor] || 'Ground Floor';

          setToPlace({
            id: toParam,
            name: displayName,
            type: 'classroom',
            block: block,
            floor: floor,
            floorLabel: floorName,
            cabin: toParam,
            icon: '📍',
            subtitle: `${blockInfo[block]?.shortLabel || 'Block ' + block} · ${floorName}`
          });
        }
      }
>>>>>>> ab63062b24cbb73392c9f2baf084cffd310a70cc
    }

    if (fromParam) {
      const fq = fromParam.trim().toLowerCase();
      const matchedFrom = allPlaces.find(p =>
        p.id.toLowerCase() === fq ||
        (p.key && p.key.toLowerCase() === fq) ||
        (p.cabin && p.cabin.toLowerCase() === fq) ||
        p.name.toLowerCase() === fq
      );
      if (matchedFrom) {
        setFromPlace(matchedFrom);
      }
    }
  }, [searchParams, allPlaces]);

  // ─── Keyboard shortcuts ────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Escape' && isFullscreen) { setIsFullscreen(false); e.preventDefault(); }
      if (e.key === 'f' || e.key === 'F') { setIsFullscreen(prev => !prev); e.preventDefault(); }
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) { setShowShortcuts(prev => !prev); e.preventDefault(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen]);

  // ─── Handle "Enter" on From/Where input to auto-parse room code ─
  const handleFromInputSubmit = () => {
    if (!fromQuery.trim()) return;
    const found = allPlaces.find(p => p.name.toLowerCase() === fromQuery.toLowerCase() || (p.cabin && p.cabin.toLowerCase() === fromQuery.toLowerCase()));
    if (found) {
      setFromPlace(found);
    } else {
      const parsed = parseRoomCode(fromQuery);
      if (parsed) setFromPlace(parsed);
    }
    setFromQuery('');
    setIsFromDropdownOpen(false);
  };

  const handleToInputSubmit = () => {
    if (!toQuery.trim()) return;
    const found = allPlaces.find(p => p.name.toLowerCase() === toQuery.toLowerCase() || (p.cabin && p.cabin.toLowerCase() === toQuery.toLowerCase()));
    if (found) {
      setToPlace(found);
    } else {
      const parsed = parseRoomCode(toQuery);
      if (parsed) setToPlace(parsed);
    }
    setToQuery('');
    setIsToDropdownOpen(false);
  };

  // ─── Swap Origin and Destination ────────────────────
  const handleSwapFromTo = () => {
    const temp = fromPlace;
    setFromPlace(toPlace);
    setToPlace(temp);
  };

  // ─── Live Navigation Controls ──────────────────────
  const startLiveNav = useCallback(() => {
    setIsLiveNavigating(true);
    setHasArrived(false);
    iframeRef.current?.contentWindow?.postMessage({
      type: 'START_LIVE_NAV',
      speed: navSpeed,
      follow: followCamera
    }, '*');
  }, [navSpeed, followCamera]);

  const pauseLiveNav = useCallback(() => {
    setIsLiveNavigating(false);
    iframeRef.current?.contentWindow?.postMessage({
      type: 'PAUSE_LIVE_NAV'
    }, '*');
  }, []);

  const restartLiveNav = useCallback(() => {
    setLiveNavProgress(0);
    setLiveStepIndex(0);
    setHasArrived(false);
    setIsLiveNavigating(true);
    iframeRef.current?.contentWindow?.postMessage({
      type: 'SEEK_LIVE_NAV',
      progress: 0
    }, '*');
    iframeRef.current?.contentWindow?.postMessage({
      type: 'START_LIVE_NAV',
      speed: navSpeed,
      follow: followCamera
    }, '*');
  }, [navSpeed, followCamera]);

  const toggleNavSpeed = useCallback(() => {
    const nextSpeed = navSpeed === 1 ? 2 : 1;
    setNavSpeed(nextSpeed);
    iframeRef.current?.contentWindow?.postMessage({
      type: 'SET_NAV_SPEED',
      speed: nextSpeed
    }, '*');
  }, [navSpeed]);

  const toggleFollowCam = useCallback(() => {
    const nextFollow = !followCamera;
    setFollowCamera(nextFollow);
    iframeRef.current?.contentWindow?.postMessage({
      type: 'SET_FOLLOW_CAM',
      follow: nextFollow
    }, '*');
  }, [followCamera]);

  const handleSeekNav = useCallback((newProgress: number) => {
    setLiveNavProgress(newProgress);
    if (newProgress < 1) setHasArrived(false);
    iframeRef.current?.contentWindow?.postMessage({
      type: 'SEEK_LIVE_NAV',
      progress: newProgress
    }, '*');
  }, []);

  // ─── Reset View — reset to default starting point (Entrance F) ──────
  const handleReset = () => {
    setFromPlace(defaultStartPlace);
    setToPlace(null);
    setFromQuery('');
    setToQuery('');
    setRouteStats(null);
<<<<<<< HEAD
    setIsArrived(false);
    setArrivedDestination(null);
=======
    setIsLiveNavigating(false);
    setLiveNavProgress(0);
    setLiveStepIndex(0);
    setHasArrived(false);
>>>>>>> ab63062b24cbb73392c9f2baf084cffd310a70cc
    sendResetToIframe();
  };

  const activeSteps = useMemo(() => {
    if (routeStats?.steps && routeStats.steps.length > 0) return routeStats.steps;
    if (fromPlace && toPlace) return generateFallbackSteps(fromPlace, toPlace);
    return [];
  }, [routeStats, fromPlace, toPlace]);

  // ─── Step-by-Step Navigation Controls (after activeSteps) ────────
  const goToStep = useCallback((idx: number) => {
    const steps = activeSteps;
    if (!steps.length) return;
    const clampedIdx = Math.max(0, Math.min(steps.length - 1, idx));
    const targetProg = steps.length > 1 ? clampedIdx / (steps.length - 1) : 0;
    setLiveStepIndex(clampedIdx);
    setLiveNavProgress(targetProg);
    setIsLiveNavigating(false);
    if (clampedIdx >= steps.length - 1) {
      setHasArrived(true);
      if (isVoiceEnabled) speakInstruction("You have arrived at your destination.");
    } else {
      setHasArrived(false);
      if (isVoiceEnabled && steps[clampedIdx]) {
        speakInstruction(steps[clampedIdx]);
      }
    }
    iframeRef.current?.contentWindow?.postMessage({
      type: 'GO_TO_STEP',
      stepIndex: clampedIdx,
      progress: targetProg,
      smooth: true
    }, '*');
  }, [activeSteps, isVoiceEnabled, speakInstruction]);

  const goToNextStep = useCallback(() => {
    goToStep(liveStepIndex + 1);
  }, [liveStepIndex, goToStep]);

  const goToPrevStep = useCallback(() => {
    goToStep(liveStepIndex - 1);
  }, [liveStepIndex, goToStep]);


  const toggleFullscreen = () => setIsFullscreen(f => !f);

  const activeDestInfo = toPlace ? (blockInfo[toPlace.block] || blockInfo.M) : null;

  // ─── Render dropdown (shared for From and Where) ────
  function renderDropdown(
    items: PlaceItem[],
    onSelect: (item: PlaceItem) => void,
    onClose: () => void,
    _label: string,
    categoryFilter: string,
    setCategoryFilter: (cat: any) => void,
    isDarkTheme: boolean
  ) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        className={`absolute left-0 right-0 top-full mt-1.5 rounded-2xl border shadow-2xl z-50 max-h-80 overflow-hidden backdrop-blur-2xl ${isDarkTheme ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'
          }`}
      >
        {/* Category filter pills */}
        <div className={`p-2 border-b flex items-center gap-1.5 overflow-x-auto scrollbar-thin ${isDarkTheme ? 'bg-gray-800/80 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
          {(['all', 'entrance', 'classroom', 'faculty', 'amenity'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition whitespace-nowrap ${categoryFilter === cat
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : isDarkTheme ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200/70'
                }`}
            >
              {cat === 'all' ? '✨ All' : cat === 'entrance' ? '🚪 Entrances' : cat === 'classroom' ? '🎓 Rooms' : cat === 'faculty' ? '👤 Faculty' : '🍽️ Amenities'}
            </button>
          ))}
          <button onClick={onClose} className={`ml-auto px-2 py-1 rounded-lg text-[10px] font-bold ${isDarkTheme ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}>✕ Close</button>
        </div>

        <div className="max-h-64 overflow-y-auto scrollbar-thin">
          {items.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400">No results. Try typing a room number like <strong>M001</strong> or <strong>F105</strong> and press Enter.</div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className={`w-full p-3 text-left flex items-center justify-between border-b last:border-0 transition-colors ${isDarkTheme ? 'hover:bg-gray-800/80 border-gray-800 text-white' : 'hover:bg-emerald-50/60 border-gray-100 text-gray-800'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{item.icon || '📍'}</span>
                  <div>
                    <p className="text-xs font-bold">{item.name}</p>
                    <p className={`text-[10px] ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>{item.subtitle || `${blockInfo[item.block]?.shortLabel || item.block} · ${item.floorLabel}`}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1 shadow-sm"
                  style={{ backgroundColor: blockInfo[item.block]?.color || '#10b981' }}>
                  <Navigation size={9} /> {item.floorLabel}
                </span>
              </button>
            ))
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <Layout>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(120,120,120,0.3); border-radius: 10px; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 py-5">

        {/* ═══ Top Breadcrumb ═══ */}
        <motion.nav
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between text-xs mb-4"
        >
          <div className="flex items-center gap-1.5">
            <Link to="/dashboard" className={`flex items-center gap-1 hover:text-emerald-500 transition ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Home size={12} /> Dashboard
            </Link>
            <ChevronRight size={11} className={isDark ? 'text-gray-600' : 'text-gray-300'} />
            <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Smart Campus Map</span>
          </div>
          <button
            onClick={() => setShowShortcuts(prev => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${isDark ? 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700' : 'bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200'}`}
          >
            <Keyboard size={12} /> Shortcuts <kbd className="font-mono text-[9px] px-1 bg-black/10 rounded">?</kbd>
          </button>
        </motion.nav>

        {/* ══════════════════════════════════════════════════════════
            NAVIGATION SEARCH HEADER — Manual From & Where
        ══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border mb-4 sm:mb-5 shadow-xl backdrop-blur-xl relative z-30 transition-all ${isDark
              ? 'bg-gray-800/90 border-gray-700/80 shadow-black/40'
              : 'bg-white/95 border-gray-200 shadow-slate-200/60'
            }`}
        >
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">

            {/* Input Dual Column with Vertical Connector Line */}
            <div className="flex-1 relative flex flex-col gap-2.5">

              {/* Connector dots line */}
              <div className="absolute left-[21px] top-[26px] bottom-[26px] w-[2px] border-l-2 border-dashed border-emerald-500/40 pointer-events-none z-10" />

              {/* ─── FROM INPUT ─── */}
              <div className="relative">
                <div className="flex items-center">
                  <div className="absolute left-3.5 z-20 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                  </div>
                  <input
                    type="text"
                    placeholder="From: Starting room/block (e.g. M001, Block F...)"
                    value={fromQuery || (fromPlace ? fromPlace.name : '')}
                    onFocus={() => { setFromQuery(''); setIsFromDropdownOpen(true); setIsToDropdownOpen(false); }}
                    onChange={(e) => { setFromQuery(e.target.value); setIsFromDropdownOpen(true); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleFromInputSubmit(); } }}
                    className={`w-full pl-11 pr-32 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold border outline-none transition-all ${isDark
                        ? 'bg-gray-900/90 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                        : 'bg-gray-50/90 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      }`}
                  />
                  <div className="absolute right-2.5 flex items-center gap-1.5 z-20">
                    <button
                      onClick={startGpsTracking}
                      title="Use live GPS location from your laptop"
                      className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-bold text-[11px] flex items-center gap-1 transition active:scale-95 border border-blue-500/30"
                    >
                      <Crosshair size={12} className={gpsStatus === 'acquiring' ? 'animate-spin' : ''} />
                      <span className="hidden sm:inline">Use GPS</span>
                    </button>
                    {fromPlace && (
                      <button
                        onClick={() => { setFromPlace(null); setFromQuery(''); stopGpsTracking(); }}
                        className="text-gray-400 hover:text-red-500 p-1 transition"
                        title="Clear starting point"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* From Autocomplete Dropdown */}
                <AnimatePresence>
                  {isFromDropdownOpen && renderDropdown(
                    filteredFromOptions,
                    (item) => { setFromPlace(item); setFromQuery(''); setIsFromDropdownOpen(false); },
                    () => setIsFromDropdownOpen(false),
                    'Select Starting Room / Block',
                    fromCategoryFilter,
                    setFromCategoryFilter,
                    isDark
                  )}
                </AnimatePresence>
              </div>

              {/* ─── WHERE TO (DESTINATION) INPUT ─── */}
              <div className="relative">
                <div className="flex items-center">
                  <div className="absolute left-3.5 z-20 flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/20 text-rose-500">
                    <MapPin size={13} className="text-rose-500 fill-rose-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Where: Destination room (e.g. M213, Library...)"
                    value={toQuery || (toPlace ? toPlace.name : '')}
                    onFocus={() => { setToQuery(''); setIsToDropdownOpen(true); setIsFromDropdownOpen(false); }}
                    onChange={(e) => { setToQuery(e.target.value); setIsToDropdownOpen(true); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleToInputSubmit(); } }}
                    className={`w-full pl-11 pr-10 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold border outline-none transition-all ${isDark
                        ? 'bg-gray-900/90 border-gray-700 text-white placeholder-gray-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                        : 'bg-gray-50/90 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      }`}
                  />
                  {toPlace && (
                    <button
                      onClick={() => { setToPlace(null); setToQuery(''); setIsArrived(false); }}
                      className="absolute right-3 text-gray-400 hover:text-red-500 p-1.5 transition"
                      title="Clear destination"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Where To Autocomplete Dropdown */}
                <AnimatePresence>
                  {isToDropdownOpen && renderDropdown(
                    filteredToOptions,
                    (item) => {
                      setToPlace(item);
                      setToQuery('');
                      setIsToDropdownOpen(false);
                      setIsArrived(false);
                      // Auto enable live GPS starting point if no start place chosen
                      if (!fromPlace) {
                        startGpsTracking();
                      }
                    },
                    () => setIsToDropdownOpen(false),
                    'Select Destination Room / Block',
                    toCategoryFilter,
                    setToCategoryFilter,
                    isDark
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Mobile & Desktop Action Toolbar (Live GPS, Swap & Reset) */}
            <div className="flex items-center justify-between lg:justify-start gap-2 pt-1 lg:pt-0">
              <button
                onClick={gpsStatus === 'active' || gpsStatus === 'simulated' ? stopGpsTracking : startGpsTracking}
                title="Toggle live laptop GPS navigation"
                className={`flex-1 lg:flex-none px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 text-xs font-bold ${
                  gpsStatus === 'active' || gpsStatus === 'simulated'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-blue-500/30'
                    : isDark ? 'bg-gray-800 border-gray-700 text-blue-400 hover:bg-gray-700' : 'bg-white border-gray-200 text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Radio size={15} className={gpsStatus === 'active' ? 'animate-pulse text-cyan-300' : ''} />
                <span>{gpsStatus === 'active' ? 'GPS Active' : gpsStatus === 'simulated' ? 'Sim Walk' : 'Live GPS'}</span>
              </button>

              <button
                onClick={handleSwapFromTo}
                title="Swap From ↔ Where"
                disabled={!fromPlace && !toPlace}
                className={`flex-1 lg:flex-none px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed ${isDark
                    ? 'bg-gray-800 border-gray-700 text-emerald-400 hover:bg-gray-700'
                    : 'bg-white border-gray-200 text-emerald-600 hover:bg-gray-50'
                  }`}
              >
                <ArrowUpDown size={15} /> <span>Swap</span>
              </button>

              <button
                onClick={() => { stopGpsTracking(); handleReset(); }}
                title="Clear both & show full campus"
                className={`flex-1 lg:flex-none px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <RotateCcw size={14} /> <span>Reset Map</span>
              </button>
            </div>

          </div>

          {/* ─── LIVE GPS TELEMETRY & STATUS BANNER ─── */}
          <AnimatePresence>
            {gpsStatus !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-3 pt-3 border-t flex flex-wrap items-center justify-between gap-2.5 text-xs ${
                  isDark ? 'border-gray-700/80' : 'border-gray-200/80'
                }`}
              >
                {/* Status Indicator */}
                <div className="flex items-center gap-2">
                  {gpsStatus === 'acquiring' && (
                    <div className="flex items-center gap-2 text-amber-500 font-bold">
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Acquiring GPS Signal from Laptop…</span>
                    </div>
                  )}
                  {gpsStatus === 'active' && gpsPosition && (
                    <div className="flex items-center gap-2 text-cyan-400 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                      <CheckCircle2 size={14} className="text-cyan-400" />
                      <span>Live GPS Connected</span>
                      <span className={`font-mono text-[11px] px-2 py-0.5 rounded-md border ${isDark ? 'bg-gray-900 border-gray-700 text-cyan-300' : 'bg-slate-100 border-gray-300 text-cyan-700'}`}>
                        {gpsPosition.lat.toFixed(5)}° N, {gpsPosition.lng.toFixed(5)}° E
                      </span>
                      <span className="text-[10px] text-gray-400">
                        (±{gpsPosition.accuracy}m Accuracy)
                      </span>
                    </div>
                  )}
                  {gpsStatus === 'simulated' && gpsPosition && (
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Simulated Indoor Walk Active (Covered Path Vanishes Live)</span>
                      <span className={`font-mono text-[11px] px-2 py-0.5 rounded-md border ${isDark ? 'bg-gray-900 border-gray-700 text-emerald-300' : 'bg-slate-100 border-gray-300 text-emerald-700'}`}>
                        {gpsPosition.lat.toFixed(5)}° N, {gpsPosition.lng.toFixed(5)}° E
                      </span>
                    </div>
                  )}
                  {gpsStatus === 'denied' && (
                    <div className="flex items-center gap-2 text-rose-500 font-bold">
                      <AlertTriangle size={14} />
                      <span>{gpsErrorMessage || 'Location permission denied in browser.'}</span>
                    </div>
                  )}
                  {gpsStatus === 'error' && (
                    <div className="flex items-center gap-2 text-amber-500 font-bold">
                      <AlertTriangle size={14} />
                      <span>{gpsErrorMessage || 'GPS unavailable.'}</span>
                    </div>
                  )}
                </div>

                {/* Telemetry Controls & Simulated Walk Trigger */}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={startSimulatedWalk}
                    title="Simulate live walking updates across campus for testing indoors"
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                      gpsStatus === 'simulated'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : isDark ? 'bg-gray-800 text-gray-400 hover:text-white border-gray-700' : 'bg-gray-100 text-gray-600 hover:text-gray-900 border-gray-200'
                    }`}
                  >
                    🚶 Simulate Walk
                  </button>
                  <button
                    onClick={stopGpsTracking}
                    className="px-2 py-1 rounded-lg text-[11px] font-bold bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 transition"
                  >
                    Stop GPS
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status hint below inputs */}
          <div className={`mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t text-[11px] font-medium flex items-center gap-2 ${isDark ? 'border-gray-700/60 text-gray-500' : 'border-gray-200/60 text-gray-400'}`}>
            {isNavigating ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>Route active: <strong className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>{fromPlace!.name}</strong>
                  <ArrowRight size={10} className="inline mx-1" />
                  <strong className={isDark ? 'text-rose-400' : 'text-rose-600'}>{toPlace!.name}</strong>
                  <span className="ml-2 text-cyan-400 font-bold">✨ Path behind user vanishes as you move!</span>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Compass size={12} className="text-emerald-500 shrink-0" />
                <span>Enter <strong>From</strong> and <strong>Where</strong> or tap quick buttons below to navigate.</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════
            MAIN GRID: 3D MAP VIEWPORT & SIDEBAR
        ══════════════════════════════════════════════════════════ */}
        <div className={`grid gap-4 sm:gap-5 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>

          {/* ─── 3D MAP CANVAS VIEWPORT ─── */}
          <div className={isFullscreen ? 'col-span-1' : 'lg:col-span-3'} ref={mapContainerRef}>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className={`relative rounded-2xl sm:rounded-3xl overflow-hidden border shadow-2xl transition-all h-[360px] sm:h-[460px] md:h-[540px] lg:h-[600px] xl:h-[640px] w-full ${isFullscreen ? '!h-[85vh]' : ''} ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-100'}`}
            >
              {/* Loading skeleton */}
              <AnimatePresence>
                {!iframeLoaded && (
                  <motion.div
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}
                  >
                    <Compass size={44} className="text-emerald-500 animate-spin" style={{ animationDuration: '3s' }} />
                    <p className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Rendering 3D Campus Model…</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <iframe
                ref={iframeRef}
                src={`/map3d/campus-3d.html?theme=${isDark ? 'dark' : 'light'}`}
                title="3D Campus Map"
                className="w-full h-full border-0"
                onLoad={() => {
                  setIframeLoaded(true);
                }}
                allow="fullscreen"
              />

              {/* Viewport Floating Controls */}
              <div className="absolute right-3 top-3 sm:right-4 sm:top-4 z-20 flex flex-col gap-2">
                <button
                  onClick={toggleFullscreen}
                  className={`p-2 sm:p-2.5 rounded-xl shadow-lg transition-all backdrop-blur-md ${isDark ? 'bg-gray-800/90 text-white hover:bg-gray-700' : 'bg-white/90 text-gray-700 hover:bg-white'}`}
                  title={`${isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} (F)`}
                >
                  {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              </div>

              {/* ═══ Floating Turn-by-Turn GPS Navigation Sign on 3D Map ═══ */}
              {isNavigating && activeSteps.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -15, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15 }}
                  className={`absolute left-3 top-3 sm:left-4 sm:top-4 z-30 shadow-2xl rounded-2xl sm:rounded-3xl border backdrop-blur-2xl transition-all overflow-hidden ${
                    isSignCollapsed ? 'w-auto max-w-xs' : 'w-[calc(100%-4.5rem)] sm:w-auto sm:max-w-md'
                  } ${isDark ? 'bg-slate-900/95 border-emerald-500/40 text-white shadow-black/60' : 'bg-slate-900/95 border-emerald-500/50 text-white shadow-emerald-950/40'}`}
                >
                  {isSignCollapsed ? (
                    /* Collapsed mini banner */
                    <div className="p-2.5 flex items-center gap-2">
                      <span className="text-base">{hasArrived ? '🎯' : getManeuverIcon(activeSteps[liveStepIndex] || '')}</span>
                      <div className="min-w-0 pr-1">
                        <p className="text-xs font-bold truncate text-white">
                          {hasArrived ? 'Arrived!' : activeSteps[liveStepIndex]}
                        </p>
                        <p className="text-[10px] text-emerald-400 font-semibold">
                          {distanceRemaining !== null ? `${distanceRemaining}m left` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-auto shrink-0">
                        <button
                          onClick={() => {
                            const nextVal = !isVoiceEnabled;
                            setIsVoiceEnabled(nextVal);
                            if (nextVal && activeSteps[liveStepIndex]) {
                              speakInstruction(activeSteps[liveStepIndex]);
                            } else {
                              window.speechSynthesis?.cancel();
                            }
                          }}
                          className={`p-1 rounded-lg transition ${isVoiceEnabled ? 'bg-emerald-500/30 text-emerald-300' : 'hover:bg-slate-800 text-gray-400 hover:text-white'}`}
                          title={isVoiceEnabled ? 'Voice Guidance Active (Click to Mute)' : 'Enable Voice Guidance (Audio GPS)'}
                        >
                          {isVoiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                        </button>
                        <button
                          onClick={() => setIsSignCollapsed(false)}
                          className="p-1 rounded-lg hover:bg-slate-800 text-gray-400 hover:text-white transition"
                          title="Expand Navigation Sign"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Expanded full GPS Turn-by-Turn Navigation Sign */
                    <div className="p-3 sm:p-4">
                      {/* Top directive row */}
                      <div className="flex items-start gap-3">
                        {/* Big maneuver icon badge */}
                        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg text-lg sm:text-xl font-black ${
                          hasArrived
                            ? 'bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-emerald-500/40 animate-bounce'
                            : isLiveNavigating
                              ? 'bg-gradient-to-br from-cyan-400 to-emerald-500 text-slate-950 shadow-cyan-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}>
                          {hasArrived ? '🎯' : getManeuverIcon(activeSteps[liveStepIndex] || '')}
                        </div>

                        {/* Maneuver details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${isLiveNavigating ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'}`} />
                              {hasArrived ? 'Destination Reached' : isLiveNavigating ? 'Real-Time Navigation' : 'Turn-by-Turn Navigation'}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => {
                                  const nextVal = !isVoiceEnabled;
                                  setIsVoiceEnabled(nextVal);
                                  if (nextVal && activeSteps[liveStepIndex]) {
                                    speakInstruction(activeSteps[liveStepIndex]);
                                  } else {
                                    window.speechSynthesis?.cancel();
                                  }
                                }}
                                className={`p-1 rounded-lg border transition ${isVoiceEnabled ? 'bg-emerald-500/30 border-emerald-400/50 text-emerald-300' : 'border-white/10 hover:bg-slate-800 text-gray-400 hover:text-white'}`}
                                title={isVoiceEnabled ? 'Voice Guidance Active (Click to Mute)' : 'Enable Voice Guidance (Audio GPS)'}
                              >
                                {isVoiceEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                              </button>
                              <button
                                onClick={handleShareRoute}
                                className="p-1 rounded-lg border border-white/10 hover:bg-slate-800 text-gray-400 hover:text-white transition"
                                title="Copy & Share Route Link"
                              >
                                <Share2 size={12} />
                              </button>
                              <span className="text-[10px] font-bold text-gray-400">
                                {Math.min(activeSteps.length, liveStepIndex + 1)}/{activeSteps.length}
                              </span>
                              <button
                                onClick={() => setIsSignCollapsed(true)}
                                className="p-0.5 rounded-md hover:bg-slate-800 text-gray-400 hover:text-white transition"
                                title="Minimize Sign"
                              >
                                <ChevronUp size={13} />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm font-bold text-white mt-1 leading-snug line-clamp-2">
                            {hasArrived
                              ? `You have arrived at ${toPlace!.name}!`
                              : (activeSteps[liveStepIndex] || 'Follow the glowing green path')}
                          </p>

                          {!hasArrived && activeSteps[liveStepIndex + 1] && (
                            <p className="text-[10px] text-gray-400 mt-1 truncate flex items-center gap-1">
                              <span className="text-gray-500 font-medium">Then:</span> {activeSteps[liveStepIndex + 1]}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Smooth Route Progress Bar with Glow */}
                      <div className="mt-3">
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
                          <motion.div
                            className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-green-500 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                            style={{ width: `${Math.min(100, Math.round(liveNavProgress * 100))}%` }}
                          />
                        </div>
                      </div>

                      {/* Live metrics & Real-Time playback toolbar */}
                      <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-300">
                          <span className="text-cyan-400 font-bold">
                            {distanceRemaining !== null ? `${distanceRemaining}m` : `${routeStats?.distanceMeters || 120}m`}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span>
                            ~{Math.max(1, Math.round(((distanceRemaining ?? (routeStats?.distanceMeters || 120)) / (routeStats?.distanceMeters || 120)) * (routeStats?.estimatedMinutes || 2)))} min
                          </span>
                        </div>

                        {/* Prev / Next step controls */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={goToPrevStep}
                            disabled={liveStepIndex <= 0}
                            title="Previous Step"
                            className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[10px] font-bold flex items-center gap-0.5 transition active:scale-95"
                          >
                            <ChevronLeft size={11} />
                            Prev
                          </button>
                          <button
                            onClick={goToNextStep}
                            disabled={liveStepIndex >= activeSteps.length - 1}
                            title="Next Step"
                            className="px-2 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 text-[10px] font-black flex items-center gap-0.5 transition active:scale-95"
                          >
                            Next
                            <ChevronRight size={11} />
                          </button>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 ml-auto">
                          {!isLiveNavigating ? (
                            <button
                              onClick={hasArrived ? restartLiveNav : startLiveNav}
                              className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow-md transition active:scale-95 cursor-pointer"
                            >
                              <Play size={10} className="fill-current" />
                              <span>{hasArrived ? 'Replay' : liveNavProgress > 0 ? 'Resume' : 'Start Live Nav'}</span>
                            </button>
                          ) : (
                            <button
                              onClick={pauseLiveNav}
                              className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow-md transition active:scale-95 cursor-pointer"
                            >
                              <Pause size={10} className="fill-current" />
                              <span>Pause</span>
                            </button>
                          )}

                          <button
                            onClick={restartLiveNav}
                            title="Restart Navigation from start"
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 transition"
                          >
                            <RotateCw size={11} />
                          </button>

                          <button
                            onClick={toggleNavSpeed}
                            title="Toggle Walk Speed"
                            className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                              navSpeed === 2
                                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                                : 'bg-slate-800 border-slate-700 text-gray-400'
                            }`}
                          >
                            {navSpeed}x
                          </button>

                          <button
                            onClick={toggleFollowCam}
                            title={followCamera ? 'Camera Following Avatar (click to Free Orbit)' : 'Free Orbit Camera (click to Follow)'}
                            className={`p-1 rounded-lg border transition ${
                              followCamera
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                : 'bg-slate-800 border-slate-700 text-gray-400'
                            }`}
                          >
                            {followCamera ? <Eye size={11} /> : <EyeOff size={11} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Floating Active Route Badge on Map — only when navigating */}
              {isNavigating && (
                <div className="absolute left-3 bottom-3 sm:left-4 sm:bottom-4 z-20 flex items-center gap-2 pointer-events-none max-w-[calc(100%-5rem)]">
                  <div className="px-2.5 py-1.5 sm:px-3 rounded-xl bg-slate-900/90 text-white text-[10px] sm:text-xs font-bold backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 animate-ping" />
                    <span className="truncate">{fromPlace!.name}</span>
                    <ArrowRight size={10} className="text-emerald-400 shrink-0" />
                    <span className="text-emerald-400 truncate">{toPlace!.name}</span>
                  </div>
                </div>
              )}

              {/* "Full Campus View" badge when not navigating */}
              {!isNavigating && iframeLoaded && (
                <div className="absolute left-3 bottom-3 sm:left-4 sm:bottom-4 z-20 pointer-events-none max-w-[calc(100%-5rem)]">
                  <div className={`px-2.5 py-1.5 sm:px-3 rounded-xl text-[10px] sm:text-xs font-bold backdrop-blur-md border shadow-lg flex items-center gap-1.5 truncate ${isDark ? 'bg-slate-900/80 text-gray-300 border-white/10' : 'bg-white/80 text-gray-600 border-gray-200'
                    }`}>
                    <Building size={12} className="text-emerald-500 shrink-0" />
                    <span className="truncate">All Blocks Active</span>
                  </div>
                </div>
              )}

              {/* Floating Toast Notification */}
              <AnimatePresence>
                {toastMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-emerald-300 font-bold text-xs px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-500/50 backdrop-blur-md"
                  >
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>{toastMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Navigation hint — responsive for mobile & desktop */}
            <div className={`flex items-center justify-between mt-2 text-[10px] sm:text-[11px] px-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="sm:hidden">👆 Drag to Rotate • ✌️ Pinch to Zoom</span>
                <span className="hidden sm:inline">🖱 Drag to Orbit</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">🔍 Scroll to Zoom</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">🏢 Click Badges to Fly-In</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                {isNavigating ? (
                  <>
                    <span>🟢 Path Vanishes as Covered</span>
                    <span>•</span>
                    <span>📍 Dynamic Live Location</span>
                  </>
                ) : (
                  <span>Select From & Where above to navigate</span>
                )}
              </div>
            </div>
          </div>

          {/* ─── RIGHT SIDEBAR ─── */}
          {!isFullscreen && (
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {/* Turn-by-turn Route Card — shown when both From and Where are selected */}
              {isNavigating ? (
                <div className={`p-4 rounded-3xl border shadow-lg ${isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200'}`}>

                  {/* Header Metrics */}
                  <div className="flex items-start justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                        <Footprints size={14} /> Shortest Walking Route
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ~{Math.max(1, Math.round(((distanceRemaining ?? (routeStats?.distanceMeters || 120)) / (routeStats?.distanceMeters || 120)) * (routeStats?.estimatedMinutes || 2)))} min
                        </span>
                        <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
<<<<<<< HEAD
                          ({routeStats?.distanceMeters || 0}m remaining)
=======
                          ({distanceRemaining !== null ? distanceRemaining : (routeStats?.distanceMeters || 160)}m)
>>>>>>> ab63062b24cbb73392c9f2baf084cffd310a70cc
                        </span>
                      </div>
                    </div>
                    {activeDestInfo && (
                      <span
                        className="px-3 py-1 rounded-xl text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: activeDestInfo.color }}
                      >
                        {activeDestInfo.shortLabel}
                      </span>
                    )}
                  </div>

                  {/* Real-Time Navigation Action Bar in Sidebar */}
                  <div className={`mt-3 p-3 rounded-2xl border ${isDark ? 'bg-gray-900/60 border-gray-700/80' : 'bg-emerald-50/50 border-emerald-100'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                        <Navigation size={12} className={isLiveNavigating ? 'animate-pulse' : ''} />
                        Real-Time Navigation
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">
                        {Math.round(liveNavProgress * 100)}% Complete
                      </span>
                    </div>

                    {/* Scrub Slider */}
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={liveNavProgress}
                      onChange={(e) => handleSeekNav(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />

                    <div className="flex items-center justify-between gap-2 mt-2.5">
                      {!isLiveNavigating ? (
                        <button
                          onClick={hasArrived ? restartLiveNav : startLiveNav}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                        >
                          <Play size={12} className="fill-current" />
                          <span>{hasArrived ? 'Replay Walk' : liveNavProgress > 0 ? 'Resume Walk' : 'Start Walk'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={pauseLiveNav}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                        >
                          <Pause size={12} className="fill-current" />
                          <span>Pause Walk</span>
                        </button>
                      )}

                      <button
                        onClick={toggleNavSpeed}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                          navSpeed === 2
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                            : isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'
                        }`}
                        title="Toggle Speed"
                      >
                        {navSpeed}x
                      </button>

                      <button
                        onClick={restartLiveNav}
                        className={`p-2 rounded-xl border transition ${
                          isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'
                        }`}
                        title="Restart from Start"
                      >
                        <RotateCw size={13} />
                      </button>
                    </div>

                    {/* ─── Prev / Next Step Buttons ─── */}
                    <div className="flex items-center justify-between gap-2 mt-2.5">
                      <button
                        onClick={goToPrevStep}
                        disabled={liveStepIndex <= 0}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-30 disabled:cursor-not-allowed ${
                          isDark ? 'bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700' : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'
                        }`}
                        title="Previous Step"
                      >
                        <ChevronLeft size={14} /> Prev Step
                      </button>
                      <span className={`text-[10px] font-bold shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {Math.min(activeSteps.length, liveStepIndex + 1)}/{activeSteps.length}
                      </span>
                      <button
                        onClick={goToNextStep}
                        disabled={liveStepIndex >= activeSteps.length - 1}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition disabled:opacity-30 disabled:cursor-not-allowed bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                        title="Next Step"
                      >
                        Next Step <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Route details */}
                  <div className="mt-3 space-y-2">
                    <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-semibold">{fromPlace.name}</span>
                      <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({fromPlace.floorLabel})</span>
                    </div>
                    <div className={`ml-[5px] border-l-2 border-dashed pl-4 py-1 text-[11px] ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                      Walk via corridors & stairs (Covered path vanishes)
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <MapPin size={11} className="text-rose-500 fill-rose-500 shrink-0" />
                      <span className="font-semibold">{toPlace.name}</span>
                      <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({toPlace.floorLabel})</span>
                    </div>
                  </div>

                  {/* Steps with Real-Time Active Step Highlighting — click any step to jump */}
                  <div className="mt-3.5 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
<<<<<<< HEAD
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Directions:</p>
                    {(routeStats?.steps && routeStats.steps.length > 0 ? routeStats.steps : [
                      `Start at ${fromPlace.name} (${fromPlace.floorLabel})`,
                      `Follow the glowing green corridor pathway`,
                      `Arrive at destination: ${toPlace.name} (${toPlace.floorLabel})`
                    ]).map((step, idx, arr) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold mt-0.5 ${idx === 0
                            ? 'bg-cyan-500/20 text-cyan-500'
                            : idx === arr.length - 1
                              ? 'bg-rose-500/20 text-rose-500'
                              : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {idx + 1}
                        </div>
                        <p className={`leading-relaxed ${idx === arr.length - 1
                            ? isDark ? 'text-emerald-400 font-bold' : 'text-emerald-600 font-bold'
                            : isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          {step}
                        </p>
                      </div>
                    ))}
=======
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Directions <span className={`normal-case font-normal ml-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>(tap step to jump)</span>:
                    </p>
                    {activeSteps.map((step, idx, arr) => {
                      const isCurrent = idx === liveStepIndex && !hasArrived;
                      const isPast = idx < liveStepIndex || hasArrived;
                      return (
                        <div
                          key={idx}
                          onClick={() => goToStep(idx)}
                          title={`Jump to Step ${idx + 1}`}
                          className={`p-2 rounded-xl transition flex items-start gap-2 text-xs cursor-pointer select-none ${
                            isCurrent
                              ? isDark
                                ? 'bg-emerald-950/40 border border-emerald-500/50 shadow-sm'
                                : 'bg-emerald-50 border border-emerald-400/50 shadow-sm'
                              : isPast
                                ? isDark ? 'opacity-70 hover:opacity-100 hover:bg-gray-800/60' : 'opacity-75 hover:opacity-100 hover:bg-gray-50'
                                : isDark ? 'hover:bg-gray-800/60' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold mt-0.5 ${
                            isPast
                              ? 'bg-emerald-500/20 text-emerald-500'
                              : isCurrent
                                ? 'bg-cyan-500 text-slate-950 font-black'
                                : idx === arr.length - 1
                                  ? 'bg-rose-500/20 text-rose-500'
                                  : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isPast ? <CheckCircle2 size={12} className="text-emerald-500" /> : idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`leading-relaxed ${
                              isCurrent
                                ? isDark ? 'text-emerald-300 font-bold' : 'text-emerald-800 font-bold'
                                : idx === arr.length - 1
                                  ? isDark ? 'text-emerald-400 font-bold' : 'text-emerald-600 font-bold'
                                  : isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {step}
                            </p>
                            {isCurrent && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-emerald-500 text-white">
                                Active Step
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
>>>>>>> ab63062b24cbb73392c9f2baf084cffd310a70cc
                  </div>
                </div>
              ) : fromPlace ? (
                /* Prompt to select destination */
                <div className={`p-5 rounded-3xl border text-center ${isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="w-10 h-10 mx-auto mb-2.5 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                    <MapPin size={20} className="animate-bounce" />
                  </div>
                  <p className={`text-sm font-bold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Select Destination</p>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Starting from <strong>{fromPlace.name}</strong>. Enter or select your destination in the <strong>Where</strong> box above.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                    <button
                      onClick={() => {
                        const m203 = allPlaces.find(p => p.cabin === 'M203' || p.id === 'room-M203');
                        if (m203) setToPlace(m203);
                      }}
                      className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[11px] font-semibold transition flex items-center gap-1"
                    >
                      👤 Faculty M203
                    </button>
                    <button
                      onClick={() => {
                        const m213 = allPlaces.find(p => p.cabin === 'M213' || p.id === 'room-M213');
                        if (m213) setToPlace(m213);
                      }}
                      className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-lg text-[11px] font-semibold transition flex items-center gap-1"
                    >
                      🎯 M213
                    </button>
                    <button
                      onClick={() => {
                        const lib = allPlaces.find(p => p.id === 'library' || p.cabin === 'F203');
                        if (lib) setToPlace(lib);
                      }}
                      className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg text-[11px] font-semibold transition flex items-center gap-1"
                    >
                      📖 Library
                    </button>
                    <button
                      onClick={() => {
                        const exam = allPlaces.find(p => p.id === 'exam-center' || p.cabin === 'E202');
                        if (exam) setToPlace(exam);
                      }}
                      className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-[11px] font-semibold transition flex items-center gap-1"
                    >
                      📝 Exam Center
                    </button>
                  </div>
                </div>
              ) : toPlace ? (
                /* Prompt to select start */
                <div className={`p-5 rounded-3xl border text-center ${isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="w-10 h-10 mx-auto mb-2.5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Compass size={20} />
                  </div>
                  <p className={`text-sm font-bold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Select Starting Location</p>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Going to <strong>{toPlace.name}</strong>. Enter your current room or block in the <strong>From</strong> box above.
                  </p>
                </div>
              ) : (
                /* Empty state — prompt user to select both locations */
                <div className={`p-5 rounded-3xl border text-center ${isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <Compass size={36} className={`mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`text-sm font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>No Route Selected</p>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Enter both <strong>From</strong> (starting room) and <strong>Where</strong> (destination) above to see walking directions.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                    <button
                      onClick={() => {
                        const m001 = allPlaces.find(p => p.cabin === 'M001' || p.id === 'room-M001');
                        const m213 = allPlaces.find(p => p.cabin === 'M213' || p.id === 'room-M213');
                        if (m001) setFromPlace(m001);
                        if (m213) setToPlace(m213);
                      }}
                      className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg text-[11px] font-medium transition"
                    >
                      Try M001 → M213
                    </button>
                    <button
                      onClick={() => {
                        const e001 = allPlaces.find(p => p.cabin === 'E001' || p.id === 'room-E001');
                        const m213 = allPlaces.find(p => p.cabin === 'M213' || p.id === 'room-M213');
                        if (e001) setFromPlace(e001);
                        if (m213) setToPlace(m213);
                      }}
                      className="px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 rounded-lg text-[11px] font-medium transition"
                    >
                      Try E001 → M213
                    </button>
                  </div>
                </div>
              )}

              {/* Faculty Directory Quick Pick */}
              <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                {/* Header with live count & clear action */}
                <div className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
                  <span className="text-xs font-bold flex items-center gap-2">
                    <User size={13} className="text-emerald-500" />
                    Faculty Cabins ({filteredFaculty.length === facultyList.length ? facultyList.length : `${filteredFaculty.length} of ${facultyList.length}`})
                  </span>
                  {(facultySearchQuery || facultyDeptFilter !== 'All') && (
                    <button
                      onClick={() => {
<<<<<<< HEAD
                        const target: PlaceItem = {
                          id: `fac-${f.id}`,
                          name: f.name,
                          type: 'faculty',
                          block: f.block,
                          floor: f.floor,
                          floorLabel: floorLabels[f.floor] || `${f.floor}th Floor`,
                          cabin: f.cabin,
                          icon: '👤',
                          subtitle: `${f.department} · Cabin ${f.cabin}`
                        };
                        setToPlace(target);
                        if (!fromPlace) {
                          startGpsTracking();
                        }
                      }}
                      className={`w-full p-2 rounded-xl text-left text-xs transition flex items-center justify-between mb-1 ${toPlace?.name === f.name
                          ? isDark ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-50 text-emerald-700 font-bold'
                          : isDark ? 'hover:bg-gray-700/60 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                        }`}
=======
                        setFacultySearchQuery('');
                        setFacultyDeptFilter('All');
                      }}
                      className="text-[10px] text-emerald-500 hover:underline font-semibold"
>>>>>>> ab63062b24cbb73392c9f2baf084cffd310a70cc
                    >
                      Clear filters
                    </button>
                  )}
                </div>

                {/* Search Bar & Department Filter Chips */}
                <div className={`p-2.5 border-b ${isDark ? 'border-gray-700/60 bg-gray-900/40' : 'border-gray-100 bg-gray-50/70'}`}>
                  <div className="relative">
                    <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      value={facultySearchQuery}
                      onChange={(e) => setFacultySearchQuery(e.target.value)}
                      placeholder="Search faculty name, dept, cabin..."
                      className={`w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border transition-colors outline-none ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                      }`}
                    />
                    {facultySearchQuery && (
                      <button
                        onClick={() => setFacultySearchQuery('')}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition ${
                          isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-400'
                        }`}
                        title="Clear search"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Horizontal Scrollable Department Filter Pills */}
                  {facultyDepartments.length > 2 && (
                    <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-thin pb-1">
                      {facultyDepartments.map((dept) => (
                        <button
                          key={dept}
                          onClick={() => setFacultyDeptFilter(dept)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition shrink-0 ${
                            facultyDeptFilter === dept
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : isDark
                                ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {dept}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Faculty List (ALL matching faculties, smoothly scrollable) */}
                <div className="max-h-72 overflow-y-auto scrollbar-thin p-2 space-y-1">
                  {filteredFaculty.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        No faculty found matching "{facultySearchQuery}"
                      </p>
                      <button
                        onClick={() => {
                          setFacultySearchQuery('');
                          setFacultyDeptFilter('All');
                        }}
                        className="mt-2 text-[11px] text-emerald-500 hover:underline font-semibold"
                      >
                        Show all {facultyList.length} faculty
                      </button>
                    </div>
                  ) : (
                    filteredFaculty.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          const target: PlaceItem = {
                            id: `fac-${f.id}`,
                            name: f.name,
                            type: 'faculty',
                            block: f.block,
                            floor: f.floor,
                            floorLabel: floorLabels[f.floor] || `${f.floor}th Floor`,
                            cabin: f.cabin || undefined,
                            icon: '👤',
                            subtitle: `${f.department}${f.cabin ? ` · Cabin ${f.cabin}` : ` · ${blockInfo[f.block]?.shortLabel || f.block}`}`
                          };
                          setToPlace(target);
                        }}
                        className={`w-full p-2.5 rounded-xl text-left text-xs transition flex items-center justify-between group ${
                          toPlace?.name === f.name
                            ? isDark ? 'bg-emerald-900/40 text-emerald-300 ring-1 ring-emerald-500/50' : 'bg-emerald-50 text-emerald-800 font-bold ring-1 ring-emerald-500/40'
                            : isDark ? 'hover:bg-gray-700/60 text-gray-200' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="pr-2 min-w-0 flex-1">
                          <p className="font-semibold text-[11px] truncate">{f.name}</p>
                          <p className={`text-[9px] truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{f.department}</p>
                        </div>
                        <span
                          className="px-2 py-0.5 rounded-lg text-[9px] font-bold text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: blockInfo[f.block]?.color || '#10b981' }}
                        >
                          {f.cabin || `${f.block} Dept`}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Map legend info */}
              <div className={`flex items-start gap-2 p-3 rounded-2xl text-[11px] ${isDark ? 'bg-gray-800/40 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
                <Info size={13} className="shrink-0 mt-0.5" />
                <span>3D map with live GPS tracking. As you walk towards your destination, covered path segments vanish in real-time.</span>
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* ═══ Destination Arrival Modal Alert ═══ */}
      <AnimatePresence>
        {isArrived && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl border ${
                isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-3xl shadow-lg ring-8 ring-emerald-500/10">
                🎉
              </div>
              <h3 className="text-xl font-black mb-1 text-emerald-400">Arrived at Destination!</h3>
              <p className="text-sm font-semibold mb-4 text-gray-300">
                You have reached <strong>{arrivedDestination || toPlace?.name}</strong>.
              </p>
              <button
                onClick={() => setIsArrived(false)}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition active:scale-95"
              >
                Got It, Thank You!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Keyboard Shortcuts Modal ═══ */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-sm mx-4 rounded-3xl p-6 shadow-2xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Keyboard size={18} className="text-emerald-500" /> Keyboard Shortcuts
                </h3>
                <button onClick={() => setShowShortcuts(false)} className={`p-1.5 rounded-xl transition ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'F', desc: 'Toggle Fullscreen 3D Map' },
                  { key: 'Esc', desc: 'Exit Fullscreen Mode' },
                  { key: '?', desc: 'Show / Hide Keyboard Shortcuts' },
                ].map(({ key, desc }) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{desc}</span>
                    <kbd className={`px-2.5 py-1 rounded-lg font-mono font-bold ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-600 shadow-sm'}`}>{key}</kbd>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default CampusMap;