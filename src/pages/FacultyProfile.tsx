import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Mail, Clock, Star, ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import { supabase } from '../supabaseClient';
import { getCurrentTeacherStatus } from './FacultyDirectory';
import { getCachedFacultyData, getFacultyAvailability, subscribeFacultyStatusChanges, startPolling } from '../utils/facultyStore';

const availabilityConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  available: { label: 'Available', color: 'text-green-700', bg: 'bg-green-100', dot: 'bg-green-500' },
  busy: { label: 'Busy', color: 'text-yellow-700', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
  'in-lecture': { label: 'In Lecture', color: 'text-blue-700', bg: 'bg-blue-100', dot: 'bg-blue-500' },
  offline: { label: 'Offline', color: 'text-gray-600', bg: 'bg-gray-100', dot: 'bg-gray-400' },
};

const FacultyProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [faculty, setFaculty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const name = decodeURIComponent(id || '');

    // Helper to build faculty object from Supabase row
    function buildFacultyObj(data: any) {
      return {
        id: data.id,
        name: data['Faculty Name'] || data.name || name,
        designation: data.designation || 'Faculty Member',
        department: data['Department'] || data.department || 'N/A',
        cabin: data['Cabin No.'] || data.cabin || 'N/A',
        email: data.email || `${name.toLowerCase().replace(/[^a-z]/g, '')}@sbjain.edu.in`,
        phone: data.phone || '+91 98765 43210',
        officeHours: data.officeHours || 'Mon-Fri: 10:30 AM - 05:30 PM',
        subjects: data.subjects || ['Core Subject 1', 'Core Subject 2'],
        qualification: data.qualification || 'Ph.D. / M.Tech',
        experience: data.experience || '10+ Years',
        photo: data.photo || '',
        availability: data.availability || 'available',
        isHOD: data.isHOD || name.toLowerCase().includes('hod'),
        ...data
      };
    }

    // Fetch from Supabase
    async function fetchFaculty() {
      try {
        const { data, error } = await supabase
          .from('faculty_schedules')
          .select('*')
          .eq('Faculty Name', name)
          .maybeSingle();

        if (!error && data) {
          setFaculty(buildFacultyObj(data));
        }
      } catch (_) { /* ignore */ }
      setLoading(false);
    }
    fetchFaculty();

    // Poll Supabase every 10 seconds — on new data, update this profile
    const stopPolling = startPolling((newData) => {
      const match = newData.find(
        (f: any) => (f['Faculty Name'] || f.name || '').toLowerCase() === name.toLowerCase()
      );
      if (match) {
        setFaculty(buildFacultyObj(match));
      }
    }, 10000);

    // Same-device instant updates
    const unsubscribeLocal = subscribeFacultyStatusChanges((detail) => {
      if (!detail.name || detail.name !== name) {
        // Check cache for this faculty
        const cached = getCachedFacultyData().find(
          (f: any) => (f['Faculty Name'] || f.name || '').toLowerCase() === name.toLowerCase()
        );
        if (cached) {
          setFaculty((prev: any) => prev ? { ...prev, availability: cached.availability } : prev);
        }
        return;
      }
      setFaculty((prev: any) => prev ? { ...prev, availability: detail.status } : prev);
    });

    // Supabase Realtime
    let channel: any;
    try {
      channel = supabase
        .channel('faculty-profile-status')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'faculty_schedules' },
          (payload) => {
            const payloadName = payload.new['Faculty Name'] || payload.new.name || '';
            if (payloadName.toLowerCase() === name.toLowerCase()) {
              setFaculty((prev: any) => prev ? buildFacultyObj(payload.new) : prev);
            }
          }
        )
        .subscribe();
    } catch (_) { /* ignore */ }

    return () => {
      stopPolling();
      unsubscribeLocal();
      if (channel) supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-32 flex flex-col items-center justify-center">
          <Loader2 size={40} className={`animate-spin mb-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          <p className={`text-lg font-medium animate-pulse ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading faculty profile...
          </p>
        </div>
      </Layout>
    );
  }

  if (!faculty) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-32 text-center">
          <p className="text-6xl mb-4">😕</p>
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Faculty Not Found</h2>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>We couldn't find the profile for the requested faculty member.</p>
          <button
            onClick={() => navigate('/faculty-directory')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            <ArrowLeft size={16} /> Back to Directory
          </button>
        </div>
      </Layout>
    );
  }

  const currentAvail = getFacultyAvailability(faculty.name || '', faculty.availability || 'available');
  const rawStatus = (currentAvail && currentAvail !== 'auto') 
    ? currentAvail 
    : (getCurrentTeacherStatus(faculty) || 'available');
    
  const status = availabilityConfig[rawStatus] || { 
    label: rawStatus, 
    color: 'text-gray-600', 
    bg: 'bg-gray-100', 
    dot: 'bg-gray-400' 
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 text-sm font-medium mb-6 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <ArrowLeft size={16} /> Back to Faculty Directory
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile Header Card */}
          <div className={`rounded-3xl overflow-hidden border mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-lg'}`}>
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-purple-600 via-purple-700 to-blue-800 relative">
              <div className="absolute inset-0 opacity-20">
                <img src="/images/campus.jpg" alt="" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="px-6 pb-6">
              {/* Avatar */}
              <div className="flex items-end gap-4 -mt-12 mb-4">
                <div className="relative">
                  <img
                    src={faculty.photo || '/images/blank.jpg'}
                    alt={faculty.name}
                    className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/blank.jpg';
                    }}
                  />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${status.dot} rounded-full border-2 border-white`} />
                </div>
                <div className="pb-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{faculty.name}</h1>
                    {faculty.isHOD && (
                      <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
                        <Star size={10} /> HOD
                      </span>
                    )}
                  </div>
                  <p className={`font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{faculty.designation}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{faculty.department}</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{faculty.qualification}</p>
                </div>

                <button
                  onClick={() => navigate('/campus-map')}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  <Navigation size={16} /> Navigate to Cabin
                </button>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[  
              { icon: MapPin, label: 'Cabin Number', value: `Cabin ${faculty.cabin}`, color: 'text-green-600' },
              { icon: Clock, label: 'Office Hours', value: faculty.officeHours, color: 'text-blue-600' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className={`p-4 rounded-2xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={16} className={color} />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
                </div>
                <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
              <h2 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Contact Information</h2>
              <div className="space-y-3">
                <a href={`mailto:${faculty.email}`} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}>
                  <Mail size={16} className="text-green-500" />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm font-medium">{faculty.email}</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Subjects */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
              <h2 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <BookOpen size={16} className="text-purple-500" /> Subjects Taught
              </h2>
              <div className="space-y-2">
                {faculty.subjects.map((subject: string, i: number) => (
                  <motion.div
                    key={subject}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-purple-50'}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">
                      {i + 1}
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{subject}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default FacultyProfile;
