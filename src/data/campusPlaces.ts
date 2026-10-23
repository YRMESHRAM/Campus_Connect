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

// Complete Known Campus Places — all entrances, gates, blocks, classrooms, labs, amenities & rooms
export const standardPlaces: PlaceItem[] = [
  // ─── 1. Entrances & Gates ───────────────────────────────────────────────
  { id: 'ENTRANCE_F', key: 'ENTRANCE_F', name: 'Entrance (F004-F005)', type: 'entrance', block: 'F', floor: 0, floorLabel: 'Ground Floor', icon: '🚪', subtitle: 'Main First Year Wing Entrance', cabin: 'ENTRANCE_F' },
  { id: 'MAIN_GATE', key: 'MAIN_GATE', name: 'S.B. Jain Main Gate', type: 'gate', block: 'GROUND', floor: 0, floorLabel: 'Ground Floor', icon: '🏛️', subtitle: 'Campus Entry & Guard Post', cabin: 'MAIN_GATE' },
  { id: 'PARKING', key: 'PARKING', name: 'Parking Area A', type: 'gate', block: 'GROUND', floor: 0, floorLabel: 'Ground Floor', icon: '🅿️', subtitle: 'Two & Four Wheeler Parking', cabin: 'PARKING' },
  { id: 'ADM', key: 'ADM', name: 'Admin Block Entrance', type: 'entrance', block: 'ADM', floor: 0, floorLabel: 'Ground Floor', icon: '🏛️', subtitle: 'Principal Office & Accounts', cabin: 'ADM' },
  { id: 'BLOCK_E', key: 'BLOCK_E', name: 'Block E Entrance', type: 'entrance', block: 'E', floor: 0, floorLabel: 'Ground Floor', icon: '📡', subtitle: 'ETC / MBA Wing Entrance', cabin: 'BLOCK_E' },
  { id: 'BLOCK_B', key: 'BLOCK_B', name: 'Block B Entrance', type: 'entrance', block: 'B', floor: 0, floorLabel: 'Ground Floor', icon: '⚙️', subtitle: 'Mechanical Wing & Stage', cabin: 'BLOCK_B' },
  { id: 'BLOCK_M', key: 'BLOCK_M', name: 'Block M Entrance', type: 'entrance', block: 'M', floor: 0, floorLabel: 'Ground Floor', icon: '💻', subtitle: 'CSE / AIML Dept Entrance', cabin: 'BLOCK_M' },
  { id: 'CANTEEN', key: 'CANTEEN', name: 'Campus Canteen', type: 'amenity', block: 'CANTEEN', floor: 0, floorLabel: 'Ground Floor', icon: '🍽️', subtitle: 'Food Court & Refreshments', cabin: 'CANTEEN' },
  { id: 'cse-notice', key: 'BLOCK_M', name: 'CSE Notice Board', type: 'entrance', block: 'M', floor: 0, floorLabel: 'Ground Floor', icon: '📌', subtitle: 'Block M corridor / CSE notice board', cabin: 'BLOCK_M' },

  // ─── 2. Key Academic Destinations & Auditoriums ─────────────────────────
  { id: 'library', name: 'Central Library (F203)', type: 'amenity', block: 'F', floor: 2, floorLabel: '2nd Floor', icon: '📖', subtitle: 'Main Books, Reading Hall & Digital Library', cabin: 'F203' },
  { id: 'auditorium', name: 'Auditorium M008', type: 'amenity', block: 'M', floor: 0, floorLabel: 'Ground Floor', icon: '🏛️', subtitle: 'Main Academic Auditorium (Ground)', cabin: 'M008' },
  { id: 'exam-center', name: 'Exam Center (E202)', type: 'amenity', block: 'E', floor: 2, floorLabel: '2nd Floor', icon: '📝', subtitle: 'University Exam Control Cell', cabin: 'E202' },
  { id: 'seminar-hall', name: 'Central Seminar Hall', type: 'amenity', block: 'M', floor: 3, floorLabel: '3rd Floor', icon: '🎙️', subtitle: 'Conferences & Major Events', cabin: 'M300' },
  { id: 'seminar-hall-etc', name: 'Seminar Hall (ETC)', type: 'amenity', block: 'E', floor: 3, floorLabel: '3rd Floor', icon: '🎙️', subtitle: 'Electronics Dept Seminar Hall', cabin: 'E300' },
  { id: 'dept-library', name: 'Dept Library (CSE)', type: 'amenity', block: 'M', floor: 2, floorLabel: '2nd Floor', icon: '📚', subtitle: 'Computer Science Reference Section', cabin: 'M200' },
  { id: 'stage', name: 'Main Stage & Amphitheatre', type: 'amenity', block: 'B', floor: 0, floorLabel: 'Ground Floor', icon: '🎭', subtitle: 'Cultural Events & Open Ground Stage', cabin: 'STAGE' },
  { id: 'computer-lab', name: 'Central Computer Lab', type: 'lab', block: 'E', floor: 0, floorLabel: 'Ground Floor', icon: '💻', subtitle: 'Ground Floor High-Speed Lab', cabin: 'E008' },
  { id: 'mca-lab', name: 'MCA Computer Lab', type: 'lab', block: 'E', floor: 1, floorLabel: '1st Floor', icon: '🖥️', subtitle: 'Post-Graduation Lab', cabin: 'E106' },
  { id: 'cad-2', name: 'CAD Lab 2', type: 'lab', block: 'M', floor: 1, floorLabel: '1st Floor', icon: '🖥️', subtitle: 'Design & Graphics Simulation Lab', cabin: 'M100' },
  { id: 'project-lab', name: 'Mechanical Project Lab', type: 'lab', block: 'B', floor: 0, floorLabel: 'Ground Floor', icon: '⚙️', subtitle: 'Fabrication & Prototyping Workshop', cabin: 'B000' },
  { id: 'admin-block', name: 'Admin Block & Principal Office', type: 'classroom', block: 'ADM', floor: 0, floorLabel: 'Ground Floor', icon: '🏛️', subtitle: 'Principal Office & Accounts Administration', cabin: 'ADM' },
  { id: 'student-section', name: 'Student Section', type: 'classroom', block: 'ADM', floor: 0, floorLabel: 'Ground Floor', icon: '📑', subtitle: 'Scholarships, Admissions & Student Services', cabin: 'ADM' },
  { id: 'room-CL', name: 'Central Computing Lab', type: 'lab', block: 'M', floor: 0, floorLabel: 'Ground Floor', icon: '💻', subtitle: 'Block M Central Computing Facility', cabin: 'CL' },
  { id: 'seek-room', name: 'SEEK Room', type: 'classroom', block: 'E', floor: 0, floorLabel: 'Ground Floor', icon: '💡', subtitle: 'Skill & Entrepreneurship Cell', cabin: 'SEEK' },
  { id: 'etc', name: 'ETC Dept Office', type: 'classroom', block: 'E', floor: 0, floorLabel: 'Ground Floor', icon: '📡', subtitle: 'Electronics & Telecom Dept Office', cabin: 'ETC' },

  // ─── 3. HOD Offices ─────────────────────────────────────────────────────
  { id: 'room-M108', name: 'HOD CSE Office (M108)', type: 'classroom', block: 'M', floor: 1, floorLabel: '1st Floor', icon: '👨‍💼', subtitle: 'Computer Science Head Office', cabin: 'M108' },
  { id: 'room-M208', name: 'HOD AIML Office (M208)', type: 'classroom', block: 'M', floor: 2, floorLabel: '2nd Floor', icon: '👨‍💼', subtitle: 'AI & Machine Learning Head Office', cabin: 'M208' },
  { id: 'room-E010', name: 'HOD ETC Office (E010)', type: 'classroom', block: 'E', floor: 0, floorLabel: 'Ground Floor', icon: '👨‍💼', subtitle: 'Electronics Dept Head Office', cabin: 'E010' },
  { id: 'room-E103', name: 'HOD MBA Office (E103)', type: 'classroom', block: 'E', floor: 1, floorLabel: '1st Floor', icon: '👨‍💼', subtitle: 'Management Studies Head Office', cabin: 'E103' },
  { id: 'room-B002', name: 'HOD Mech Office (B002)', type: 'classroom', block: 'B', floor: 0, floorLabel: 'Ground Floor', icon: '👨‍💼', subtitle: 'Mechanical Engineering Head Office', cabin: 'B002' },
  { id: 'room-B103', name: 'HOD Electrical Office (B103)', type: 'classroom', block: 'B', floor: 1, floorLabel: '1st Floor', icon: '👨‍💼', subtitle: 'Electrical Engineering Head Office', cabin: 'B103' },

  // ─── 4. Specialized Labs ────────────────────────────────────────────────
  { id: 'room-E005', name: 'Robotics & IoT Lab (E005)', type: 'lab', block: 'E', floor: 0, floorLabel: 'Ground Floor', icon: '🤖', subtitle: 'Advanced Robotics Lab', cabin: 'E005' },
  { id: 'room-M303', name: 'Emerging Tech Lab (M303)', type: 'lab', block: 'M', floor: 3, floorLabel: '3rd Floor', icon: '⚡', subtitle: 'AI & Cloud Computing Lab', cabin: 'M303' },
  { id: 'room-F001', name: 'Physics Lab (F001)', type: 'lab', block: 'F', floor: 0, floorLabel: 'Ground Floor', icon: '🔬', subtitle: '1st Year Applied Physics Lab', cabin: 'F001' },
  { id: 'room-F002', name: 'Chemistry Lab (F002)', type: 'lab', block: 'F', floor: 0, floorLabel: 'Ground Floor', icon: '🧪', subtitle: '1st Year Applied Chemistry Lab', cabin: 'F002' },
  { id: 'room-F103A1', name: 'Applied Physics Project Lab (F103 A1)', type: 'lab', block: 'F', floor: 1, floorLabel: '1st Floor', icon: '🔬', subtitle: '1st Year Advanced Physics Lab', cabin: 'F103A1' },

  // ─── 5. Block F Classrooms & Rooms (First Year Wing) ────────────────────
  // Ground Floor
  { id: 'room-F003', name: 'Room F003', type: 'classroom', block: 'F', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block F – First Year · Ground Floor', cabin: 'F003' },
  { id: 'room-F004', name: 'Classroom F004', type: 'classroom', block: 'F', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'First Year Section A · Ground Floor', cabin: 'F004' },
  { id: 'room-G004', name: 'Room G004', type: 'classroom', block: 'F', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block F – First Year · Ground Floor', cabin: 'G004' },
  { id: 'room-F005', name: 'Room F005', type: 'classroom', block: 'F', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block F – First Year · Ground Floor', cabin: 'F005' },
  { id: 'room-F006', name: 'Room F006', type: 'classroom', block: 'F', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block F – First Year · Ground Floor', cabin: 'F006' },
  { id: 'room-F007', name: 'Room F007', type: 'classroom', block: 'F', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block F – First Year · Ground Floor', cabin: 'F007' },
  { id: 'room-F008', name: 'Washroom F008', type: 'amenity', block: 'F', floor: 0, floorLabel: 'Ground Floor', icon: '🚻', subtitle: 'Block F Ground Washroom', cabin: 'F008' },
  // 1st Floor
  { id: 'room-F101', name: 'Room F101', type: 'classroom', block: 'F', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block F – First Year · 1st Floor', cabin: 'F101' },
  { id: 'room-F102', name: 'Room F102', type: 'classroom', block: 'F', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block F – First Year · 1st Floor', cabin: 'F102' },
  { id: 'room-F103', name: 'Room F103', type: 'classroom', block: 'F', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block F – First Year · 1st Floor', cabin: 'F103' },
  { id: 'room-F104', name: 'Room F104', type: 'classroom', block: 'F', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block F – First Year · 1st Floor', cabin: 'F104' },
  { id: 'room-F105', name: 'Classroom F105', type: 'classroom', block: 'F', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'First Year Section B · 1st Floor', cabin: 'F105' },
  { id: 'room-F106', name: 'Room F106', type: 'classroom', block: 'F', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block F – First Year · 1st Floor', cabin: 'F106' },
  { id: 'room-F107', name: 'Girls Washroom (F107 GW)', type: 'amenity', block: 'F', floor: 1, floorLabel: '1st Floor', icon: '🚻', subtitle: 'Block F 1st Floor Washroom', cabin: 'F107' },
  // 2nd Floor
  { id: 'room-F201', name: 'Classroom F201', type: 'classroom', block: 'F', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'First Year Section C · 2nd Floor', cabin: 'F201' },
  { id: 'room-F202', name: 'Room F202', type: 'classroom', block: 'F', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'Block F – First Year · 2nd Floor', cabin: 'F202' },
  { id: 'room-F205', name: 'Room F205', type: 'classroom', block: 'F', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'Block F – First Year · 2nd Floor', cabin: 'F205' },
  { id: 'room-F206', name: 'Boys Washroom (F206 BW)', type: 'amenity', block: 'F', floor: 2, floorLabel: '2nd Floor', icon: '🚻', subtitle: 'Block F 2nd Floor Washroom', cabin: 'F206' },

  // ─── 6. Block M Classrooms & Rooms (CSE / AIML Wing) ────────────────────
  // Ground Floor
  { id: 'room-M001', name: 'Classroom M001', type: 'classroom', block: 'M', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'CSE Ground Floor Lab · Ground Floor', cabin: 'M001' },
  { id: 'room-M002', name: 'Washroom (M002)', type: 'amenity', block: 'M', floor: 0, floorLabel: 'Ground Floor', icon: '🚻', subtitle: 'Block M Ground Washroom', cabin: 'M002' },
  { id: 'room-M003A1', name: 'Room M003 A1', type: 'classroom', block: 'M', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · Ground Floor', cabin: 'M003A1' },
  { id: 'room-M003A4', name: 'Room M003 A4', type: 'classroom', block: 'M', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · Ground Floor', cabin: 'M003A4' },
  { id: 'room-M003A5', name: 'Room M003 A5', type: 'classroom', block: 'M', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · Ground Floor', cabin: 'M003A5' },
  { id: 'room-M003A7', name: 'Room M003 A7', type: 'classroom', block: 'M', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · Ground Floor', cabin: 'M003A7' },
  { id: 'room-M003A8', name: 'Room M003 A8', type: 'classroom', block: 'M', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · Ground Floor', cabin: 'M003A8' },
  { id: 'room-M004', name: 'Room M004', type: 'classroom', block: 'M', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · Ground Floor', cabin: 'M004' },
  { id: 'room-M005', name: 'Room M005', type: 'classroom', block: 'M', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · Ground Floor', cabin: 'M005' },
  { id: 'room-M006', name: 'Room M006', type: 'classroom', block: 'M', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · Ground Floor', cabin: 'M006' },
  { id: 'room-M007', name: 'Room M007', type: 'classroom', block: 'M', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · Ground Floor', cabin: 'M007' },
  { id: 'mw', name: 'Mens Washroom (MW)', type: 'amenity', block: 'M', floor: 0, floorLabel: 'Ground Floor', icon: '🚻', subtitle: 'Block M Ground Restroom', cabin: 'MW' },
  // 1st Floor
  { id: 'room-M101', name: 'Classroom M101', type: 'classroom', block: 'M', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'CSE 2nd Year Lecture Hall · 1st Floor', cabin: 'M101' },
  { id: 'room-M102', name: 'Girls Washroom (M102 GW)', type: 'amenity', block: 'M', floor: 1, floorLabel: '1st Floor', icon: '🚻', subtitle: 'Block M 1st Floor Restroom', cabin: 'M102' },
  { id: 'room-M103', name: 'Room M103', type: 'classroom', block: 'M', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 1st Floor', cabin: 'M103' },
  { id: 'room-M104', name: 'Room M104', type: 'classroom', block: 'M', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 1st Floor', cabin: 'M104' },
  { id: 'room-M105', name: 'Room M105', type: 'classroom', block: 'M', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 1st Floor', cabin: 'M105' },
  { id: 'room-M106', name: 'Faculty Washroom (M106 FW)', type: 'amenity', block: 'M', floor: 1, floorLabel: '1st Floor', icon: '🚻', subtitle: 'Block M 1st Floor Faculty Washroom', cabin: 'M106' },
  { id: 'room-M107', name: 'Room M107', type: 'classroom', block: 'M', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 1st Floor', cabin: 'M107' },
  { id: 'room-M109', name: 'Room M109', type: 'classroom', block: 'M', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 1st Floor', cabin: 'M109' },
  { id: 'room-M110', name: 'Room M110', type: 'classroom', block: 'M', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 1st Floor', cabin: 'M110' },
  { id: 'room-M111', name: 'Room M111', type: 'classroom', block: 'M', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 1st Floor', cabin: 'M111' },
  { id: 'room-M112A1', name: 'Room M112 A1', type: 'classroom', block: 'M', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 1st Floor', cabin: 'M112A1' },
  { id: 'room-M112A2', name: 'Room M112 A2', type: 'classroom', block: 'M', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 1st Floor', cabin: 'M112A2' },
  { id: 'room-M113', name: 'Room M113', type: 'classroom', block: 'M', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 1st Floor', cabin: 'M113' },
  { id: 'room-M114', name: 'Room M114', type: 'classroom', block: 'M', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 1st Floor', cabin: 'M114' },
  // 2nd Floor
  { id: 'room-M201', name: 'Classroom M201', type: 'classroom', block: 'M', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'AIML 3rd Year Lecture Hall · 2nd Floor', cabin: 'M201' },
  { id: 'room-M202', name: 'Boys Washroom (M202 BW)', type: 'amenity', block: 'M', floor: 2, floorLabel: '2nd Floor', icon: '🚻', subtitle: 'Block M 2nd Floor Washroom', cabin: 'M202' },
  { id: 'faculty-m203', name: 'Faculty Room M203', type: 'faculty', block: 'M', floor: 2, floorLabel: '2nd Floor', icon: '👤', subtitle: 'CSE Faculty Room · 2nd Floor', cabin: 'M203' },
  { id: 'faculty-m204', name: 'Faculty Room M204', type: 'faculty', block: 'M', floor: 2, floorLabel: '2nd Floor', icon: '👤', subtitle: 'AIML Faculty Room · 2nd Floor', cabin: 'M204' },
  { id: 'room-M205', name: 'Room M205', type: 'classroom', block: 'M', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 2nd Floor', cabin: 'M205' },
  { id: 'room-M206', name: 'Room M206', type: 'classroom', block: 'M', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 2nd Floor', cabin: 'M206' },
  { id: 'room-M207', name: 'Room M207', type: 'classroom', block: 'M', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 2nd Floor', cabin: 'M207' },
  { id: 'room-M209', name: 'Room M209', type: 'classroom', block: 'M', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 2nd Floor', cabin: 'M209' },
  { id: 'room-M211', name: 'Room M211', type: 'classroom', block: 'M', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 2nd Floor', cabin: 'M211' },
  { id: 'room-M212', name: 'Room M212 A2', type: 'classroom', block: 'M', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 2nd Floor', cabin: 'M212' },
  { id: 'room-M213', name: 'Classroom M213', type: 'classroom', block: 'M', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'AIML Lecture Hall · 2nd Floor', cabin: 'M213' },
  { id: 'room-M214', name: 'Room M214', type: 'classroom', block: 'M', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 2nd Floor', cabin: 'M214' },
  { id: 'room-M215', name: 'Room M215', type: 'classroom', block: 'M', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 2nd Floor', cabin: 'M215' },
  // 3rd Floor
  { id: 'room-M301', name: 'Classroom M301', type: 'classroom', block: 'M', floor: 3, floorLabel: '3rd Floor', icon: '🎓', subtitle: 'Final Year CSE Lecture Hall · 3rd Floor', cabin: 'M301' },
  { id: 'room-M302', name: 'Girls Washroom (M302 GW)', type: 'amenity', block: 'M', floor: 3, floorLabel: '3rd Floor', icon: '🚻', subtitle: 'Block M 3rd Floor Washroom', cabin: 'M302' },
  { id: 'room-B202-3', name: 'Room M303-B', type: 'classroom', block: 'M', floor: 3, floorLabel: '3rd Floor', icon: '🎓', subtitle: 'Block M Tutorial Room · 3rd Floor', cabin: 'M303B' },
  { id: 'room-M304', name: 'Room M304', type: 'classroom', block: 'M', floor: 3, floorLabel: '3rd Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 3rd Floor', cabin: 'M304' },
  { id: 'room-M305', name: 'Room M305', type: 'classroom', block: 'M', floor: 3, floorLabel: '3rd Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 3rd Floor', cabin: 'M305' },
  { id: 'room-M307', name: 'Room M307', type: 'classroom', block: 'M', floor: 3, floorLabel: '3rd Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 3rd Floor', cabin: 'M307' },
  { id: 'room-M308', name: 'Room M308', type: 'classroom', block: 'M', floor: 3, floorLabel: '3rd Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 3rd Floor', cabin: 'M308' },
  { id: 'room-M309', name: 'Room M309', type: 'classroom', block: 'M', floor: 3, floorLabel: '3rd Floor', icon: '🎓', subtitle: 'Block M – CSE / AIML · 3rd Floor', cabin: 'M309' },

  // ─── 7. Block E Classrooms & Rooms (ETC / MBA / MCA Wing) ───────────────
  // Ground Floor
  { id: 'room-E001', name: 'Room E001', type: 'classroom', block: 'E', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · Ground Floor', cabin: 'E001' },
  { id: 'room-E0002', name: 'Room E002', type: 'classroom', block: 'E', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · Ground Floor', cabin: 'E002' },
  { id: 'room-E003', name: 'Room E003', type: 'classroom', block: 'E', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · Ground Floor', cabin: 'E003' },
  { id: 'room-E004', name: 'Room E004', type: 'classroom', block: 'E', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · Ground Floor', cabin: 'E004' },
  { id: 'room-E006', name: 'Room E006 Lab', type: 'lab', block: 'E', floor: 0, floorLabel: 'Ground Floor', icon: '💻', subtitle: 'Electronics Lab · Ground Floor', cabin: 'E006' },
  { id: 'room-G005', name: 'Room G005', type: 'classroom', block: 'E', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · Ground Floor', cabin: 'G005' },
  { id: 'room-E007', name: 'Washroom E007', type: 'amenity', block: 'E', floor: 0, floorLabel: 'Ground Floor', icon: '🚻', subtitle: 'Block E Ground Washroom', cabin: 'E007' },
  { id: 'room-E009', name: 'Room E009', type: 'classroom', block: 'E', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · Ground Floor', cabin: 'E009' },
  { id: 'room-E011', name: 'Room E011', type: 'classroom', block: 'E', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · Ground Floor', cabin: 'E011' },
  // 1st Floor
  { id: 'room-E101', name: 'Classroom E101', type: 'classroom', block: 'E', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'ETC Dept Lecture Hall · 1st Floor', cabin: 'E101' },
  { id: 'room-E102', name: 'Room E102', type: 'classroom', block: 'E', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · 1st Floor', cabin: 'E102' },
  { id: 'room-E104', name: 'Room E104', type: 'classroom', block: 'E', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · 1st Floor', cabin: 'E104' },
  { id: 'room-E105', name: 'Room E105', type: 'classroom', block: 'E', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · 1st Floor', cabin: 'E105' },
  { id: 'room-E107', name: 'Room E107', type: 'classroom', block: 'E', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · 1st Floor', cabin: 'E107' },
  { id: 'room-E-BW', name: 'Boys Washroom (Block E)', type: 'amenity', block: 'E', floor: 1, floorLabel: '1st Floor', icon: '🚻', subtitle: 'Block E 1st Floor Washroom', cabin: 'EBW' },
  { id: 'room-E108', name: 'Room E108', type: 'classroom', block: 'E', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · 1st Floor', cabin: 'E108' },
  { id: 'room-E109', name: 'Room E109', type: 'classroom', block: 'E', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · 1st Floor', cabin: 'E109' },
  { id: 'room-E110', name: 'Room E110', type: 'classroom', block: 'E', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · 1st Floor', cabin: 'E110' },
  { id: 'room-E111', name: 'Room E111', type: 'classroom', block: 'E', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · 1st Floor', cabin: 'E111' },
  { id: 'faculty-e109', name: 'Faculty Room E (E109)', type: 'faculty', block: 'E', floor: 1, floorLabel: '1st Floor', icon: '👤', subtitle: 'ETC Faculty Room · 1st Floor', cabin: 'E109' },
  // 2nd Floor
  { id: 'room-E201', name: 'Room E201', type: 'classroom', block: 'E', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · 2nd Floor', cabin: 'E201' },
  { id: 'faculty-e', name: 'Faculty Room (Block E)', type: 'faculty', block: 'E', floor: 2, floorLabel: '2nd Floor', icon: '👤', subtitle: 'Management & MCA Faculty Room · 2nd Floor', cabin: 'E200' },
  { id: 'room-E206', name: 'Room E206 A1', type: 'classroom', block: 'E', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · 2nd Floor', cabin: 'E206' },
  { id: 'room-E207', name: 'Room E207', type: 'classroom', block: 'E', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · 2nd Floor', cabin: 'E207' },
  { id: 'room-E-GW', name: 'Girls Washroom (Block E)', type: 'amenity', block: 'E', floor: 2, floorLabel: '2nd Floor', icon: '🚻', subtitle: 'Block E 2nd Floor Washroom', cabin: 'EGW' },
  { id: 'room-E208', name: 'Room E208', type: 'classroom', block: 'E', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · 2nd Floor', cabin: 'E208' },
  { id: 'room-E209', name: 'Room E209', type: 'classroom', block: 'E', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · 2nd Floor', cabin: 'E209' },
  { id: 'room-E210', name: 'Room E210', type: 'classroom', block: 'E', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · 2nd Floor', cabin: 'E210' },
  { id: 'room-E211', name: 'Room E211', type: 'classroom', block: 'E', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · 2nd Floor', cabin: 'E211' },
  // 3rd Floor
  { id: 'room-E301', name: 'Room E301', type: 'classroom', block: 'E', floor: 3, floorLabel: '3rd Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · 3rd Floor', cabin: 'E301' },
  { id: 'room-E302', name: 'Room E302', type: 'classroom', block: 'E', floor: 3, floorLabel: '3rd Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · 3rd Floor', cabin: 'E302' },
  { id: 'room-E303', name: 'Room E303', type: 'classroom', block: 'E', floor: 3, floorLabel: '3rd Floor', icon: '🎓', subtitle: 'Block E – ETC / MBA / MCA · 3rd Floor', cabin: 'E303' },

  // ─── 8. Block B Classrooms & Rooms (Mechanical / Electrical) ────────────
  // Ground Floor
  { id: 'room-B001', name: 'Room B001', type: 'classroom', block: 'B', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block B – Mech / Electrical · Ground Floor', cabin: 'B001' },
  { id: 'room-B003', name: 'Room B003 A2', type: 'classroom', block: 'B', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block B – Mech / Electrical · Ground Floor', cabin: 'B003' },
  { id: 'room-B004', name: 'Room B004', type: 'classroom', block: 'B', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block B – Mech / Electrical · Ground Floor', cabin: 'B004' },
  { id: 'room-B005', name: 'Room B005', type: 'classroom', block: 'B', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block B – Mech / Electrical · Ground Floor', cabin: 'B005' },
  { id: 'room-B007', name: 'Room B007', type: 'classroom', block: 'B', floor: 0, floorLabel: 'Ground Floor', icon: '🎓', subtitle: 'Block B – Mech / Electrical · Ground Floor', cabin: 'B007' },
  // 1st Floor
  { id: 'room-B101', name: 'Classroom B101', type: 'classroom', block: 'B', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Mechanical Dept Lecture Hall · 1st Floor', cabin: 'B101' },
  { id: 'room-B102', name: 'Room B102', type: 'classroom', block: 'B', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block B – Mech / Electrical · 1st Floor', cabin: 'B102' },
  { id: 'room-B104', name: 'Room B104', type: 'classroom', block: 'B', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block B – Mech / Electrical · 1st Floor', cabin: 'B104' },
  { id: 'room-B105', name: 'Room B105', type: 'classroom', block: 'B', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block B – Mech / Electrical · 1st Floor', cabin: 'B105' },
  { id: 'room-B106A1', name: 'Room B106 A1', type: 'classroom', block: 'B', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block B – Mech / Electrical · 1st Floor', cabin: 'B106A1' },
  { id: 'room-B106A2', name: 'Room B106 A2', type: 'classroom', block: 'B', floor: 1, floorLabel: '1st Floor', icon: '🎓', subtitle: 'Block B – Mech / Electrical · 1st Floor', cabin: 'B106A2' },
  // 2nd Floor
  { id: 'room-B201', name: 'Room B201', type: 'classroom', block: 'B', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'Block B – Mech / Electrical · 2nd Floor', cabin: 'B201' },
  { id: 'room-B202', name: 'Room B202', type: 'classroom', block: 'B', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'Block B – Mech / Electrical · 2nd Floor', cabin: 'B202' },
  { id: 'room-B203', name: 'Room B203', type: 'classroom', block: 'B', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'Block B – Mech / Electrical · 2nd Floor', cabin: 'B203' },
  { id: 'room-B206A2', name: 'Room B206 A2', type: 'classroom', block: 'B', floor: 2, floorLabel: '2nd Floor', icon: '🎓', subtitle: 'Block B – Mech / Electrical · 2nd Floor', cabin: 'B206A2' },
  { id: 'room-B206FW', name: 'Faculty Washroom (B206 FW)', type: 'amenity', block: 'B', floor: 2, floorLabel: '2nd Floor', icon: '🚻', subtitle: 'Block B 2nd Floor Washroom', cabin: 'B206FW' },
];
