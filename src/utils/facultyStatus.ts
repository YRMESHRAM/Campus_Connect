import { supabase } from '../supabaseClient';
import { normalizeFacultyName } from './facultyStore';

export type Status = 'available' | 'busy' | 'in-lecture' | 'meeting' | 'offline' | 'auto';

export function endOfTeachingDay(): Date {
  const d = new Date();
  d.setHours(17, 30, 0, 0);
  return d;
}

export function isManualActive(row: any): boolean {
  if (row.availability_mode !== 'manual') return false;
  
  let untilTime = endOfTeachingDay().getTime();
  if (row.availability_until) {
    untilTime = new Date(row.availability_until).getTime();
  }
  
  return Date.now() < untilTime;
}

export function autoStatus(teacher: any, targetTime: Date = new Date()): string {
  const hours = targetTime.getHours();
  const minutes = targetTime.getMinutes();
  const currentTimeInMinutes = hours * 60 + minutes;

  const startTime = 10 * 60 + 30; // 10:30 AM (630 mins)
  const endTime = 17 * 60 + 30;   // 05:30 PM (1050 mins)

  // 1. Force "offline" outside working hours (Before 10:30 AM or After 5:30 PM)
  if (currentTimeInMinutes < startTime || currentTimeInMinutes > endTime) {
    return "offline";
  }

  // 2. Check current time slot during working hours
  let currentActivity = "";
  if (currentTimeInMinutes >= 10 * 60 + 30 && currentTimeInMinutes < 11 * 60 + 30) currentActivity = teacher["10:30 - 11:30"] || teacher.slot_1030_1130;
  else if (currentTimeInMinutes >= 11 * 60 + 30 && currentTimeInMinutes < 12 * 60 + 30) currentActivity = teacher["11:30 - 12:30"] || teacher.slot_1130_1230;
  else if (currentTimeInMinutes >= 12 * 60 + 30 && currentTimeInMinutes < 13 * 60 + 30) currentActivity = teacher["12:30 - 1:30"] || teacher.slot_1230_1330;
  else if (currentTimeInMinutes >= 13 * 60 + 30 && currentTimeInMinutes < 14 * 60 + 30) currentActivity = teacher["1:30 - 2:30"] || teacher.slot_1330_1430;
  else if (currentTimeInMinutes >= 14 * 60 + 30 && currentTimeInMinutes < 15 * 60 + 30) currentActivity = teacher["2:30 - 3:30"] || teacher.slot_1430_1530;
  else if (currentTimeInMinutes >= 15 * 60 + 30 && currentTimeInMinutes < 16 * 60 + 30) currentActivity = teacher["3:30 - 4:30"] || teacher.slot_1530_1630;
  else if (currentTimeInMinutes >= 16 * 60 + 30 && currentTimeInMinutes <= 17 * 60 + 30) currentActivity = teacher["4:30 - 5:30"] || teacher.slot_1630_1730;

  if (!currentActivity || currentActivity.toLowerCase().includes("available")) {
    return "available";
  }

  return "in-lecture";
}

export function resolveStatus(row: any): string {
  return isManualActive(row) ? (row.availability || 'available') : autoStatus(row);
}

export function skipAutoWrite(row: any): boolean {
  return isManualActive(row);
}

export async function setManualStatus(facultyName: string, status: string): Promise<void> {
  const payload = { 
    availability: status, 
    availability_mode: 'manual', 
    availability_until: endOfTeachingDay().toISOString() 
  };
  
  // write localStorage for instant teacher UI
  const STORAGE_KEY = 'faculty_availabilities';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[facultyName] = status;
    const norm = normalizeFacultyName(facultyName);
    if (norm) map[norm] = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {}

  // First attempt: update by 'Faculty Name' column
  let { data, error } = await supabase
    .from('faculty_schedules')
    .update(payload)
    .eq('Faculty Name', facultyName)
    .select();

  // If that fails (e.g. column doesn't exist) or matches 0 rows, try 'name' column
  if (error || !data || data.length === 0) {
    const { data: nameData, error: nameError } = await supabase
      .from('faculty_schedules')
      .update(payload)
      .eq('name', facultyName)
      .select();

    data = nameData;
    error = nameError;
  }

  // If still fails or matches 0 rows, fetch all and try manual matching
  if (error || !data || data.length === 0) {
    const norm = normalizeFacultyName(facultyName);
    const { data: allData, error: allDataError } = await supabase.from('faculty_schedules').select('*');
    if (allDataError) throw allDataError;
    
    if (allData && allData.length > 0) {
      const match = allData.find((f: any) => {
        const fName = f['Faculty Name'] || f.name || '';
        return fName === facultyName || (norm && normalizeFacultyName(fName) === norm);
      });
      if (match) {
        const { error: matchError } = await supabase
          .from('faculty_schedules')
          .update(payload)
          .eq('id', match.id);
        if (matchError) throw matchError;
      } else {
        throw new Error('Faculty member not found');
      }
    } else {
      throw new Error('No faculty data found');
    }
  }
}

export function subscribeFacultyStatus(onChange: () => void): () => void {
  const channel = supabase.channel('faculty-status-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'faculty_schedules' }, async () => {
      onChange();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
