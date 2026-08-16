import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Clock, MapPin, BookOpen, Edit3, Save, Camera, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import { supabase } from '../supabaseClient';
import { getFacultyCredentials, updateFacultyCredentials, verifyFacultyPassword } from '../utils/facultyStore';

const FacultyProfilePage: React.FC = () => {
  const { isDark } = useTheme();
  const facultyName = localStorage.getItem('facultyName') || 'Dr. Rajesh Kumar Sharma';

  const savedCreds = getFacultyCredentials(facultyName);
  const defaultEmail = savedCreds.email || localStorage.getItem('facultyEmail') || `${facultyName.toLowerCase().replace(/[^a-z]/g, '')}@sbjain.edu.in`;
  const defaultPassword = savedCreds.password || 'Pass@123';

  const [dbFacultyName, setDbFacultyName] = useState<string>('');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    id: null as number | null,
    name: facultyName,
    designation: savedCreds.designation || localStorage.getItem('facultyDesignation') || 'Head of Department',
    department: localStorage.getItem('facultyDepartment') || 'Computer Science & Engineering',
    cabin: savedCreds.cabin || localStorage.getItem('facultyCabin') || 'A-101',
    email: defaultEmail,
    phone: '+91 98765 43210',
    officeHours: savedCreds.officeHours || 'Mon-Fri: 10:00 AM - 05:00 PM',
    subjects: ['Data Structures', 'Algorithms', 'Machine Learning'],
    qualification: savedCreds.qualification || 'Ph.D. (IIT Bombay), M.Tech (NIT Nagpur)',

    photo: localStorage.getItem('facultyPhoto') || '',
    password: defaultPassword,
  });

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passStatus, setPassStatus] = useState({ type: '', msg: '' });
  const [passSaving, setPassSaving] = useState(false);

  // Fetch logged-in faculty member's data from Supabase + local credentials store
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const creds = getFacultyCredentials(facultyName);
      let data: any = null;
      let matchedName = facultyName;

      try {
        const { data: exactData } = await supabase
          .from('faculty_schedules')
          .select('*')
          .eq('Faculty Name', facultyName)
          .maybeSingle();

        if (exactData) {
          data = exactData;
          matchedName = exactData['Faculty Name'];
        } else {
          const { data: ilikeData } = await supabase
            .from('faculty_schedules')
            .select('*')
            .ilike('Faculty Name', `%${facultyName}%`);
          if (ilikeData && ilikeData.length > 0) {
            data = ilikeData[0];
            matchedName = ilikeData[0]['Faculty Name'];
          }
        }
      } catch (err) {
        console.error('Error fetching profile from Supabase:', err);
      }

      setDbFacultyName(matchedName);

      const finalEmail = (data && data.email) || creds.email || localStorage.getItem('facultyEmail') || `${facultyName.toLowerCase().replace(/[^a-z]/g, '')}@sbjain.edu.in`;
      const finalPassword = (data && data.password) || creds.password || 'Pass@123';

      setProfile({
        id: data ? data.id : null,
        name: (data && data['Faculty Name']) || facultyName,
        designation: creds.designation || (data && data.designation) || localStorage.getItem('facultyDesignation') || 'Faculty Member',
        department: (data && data['Department']) || localStorage.getItem('facultyDepartment') || 'Computer Science & Engineering',
        cabin: (data && data['Cabin No.']) || creds.cabin || localStorage.getItem('facultyCabin') || 'A-101',
        email: finalEmail,
        phone: (data && data.phone) || '+91 98765 43210',
        officeHours: creds.officeHours || (data && data.officeHours) || 'Mon-Fri: 10:00 AM - 05:00 PM',
        subjects: (data && data.subjects) || ['Data Structures', 'Algorithms', 'Machine Learning'],
        qualification: creds.qualification || (data && data.qualification) || 'Ph.D. / M.Tech',

        photo: (data && data.photo) || localStorage.getItem('facultyPhoto') || '',
        password: finalPassword,
      });

      setLoading(false);
    }

    fetchProfile();
  }, [facultyName]);

  // Save profile changes (email, cabin, office hours, etc.)
  const handleSave = async () => {
    setSaving(true);

    // 1. Update local storage & credentials store
    localStorage.setItem('facultyEmail', profile.email);
    localStorage.setItem('facultyCabin', profile.cabin);
    localStorage.setItem('facultyDesignation', profile.designation);
    updateFacultyCredentials(profile.name, {
      email: profile.email,
      cabin: profile.cabin,
      designation: profile.designation,
      officeHours: profile.officeHours,
      qualification: profile.qualification,
    });

    // 2. Persist to real Supabase database table 'faculty_schedules'
    const targetName = dbFacultyName || profile.name;
    const supabasePayload = {
      'Cabin No.': profile.cabin,
      email: profile.email,
    };

    try {
      const { error: updateError } = await supabase
        .from('faculty_schedules')
        .update(supabasePayload)
        .eq('Faculty Name', targetName);

      if (updateError) {
        console.warn('Exact match update failed, attempting ilike match:', updateError);
        await supabase
          .from('faculty_schedules')
          .update(supabasePayload)
          .ilike('Faculty Name', `%${profile.name}%`);
      }
    } catch (err) {
      console.error('Database update error:', err);
    }

    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassStatus({ type: '', msg: '' });

    const isCurrentValid = verifyFacultyPassword(profile.name, passwords.current, profile.password);
    if (!isCurrentValid) {
      setPassStatus({ type: 'error', msg: 'Current password is incorrect.' });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPassStatus({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }
    if (passwords.new.length < 6) {
      setPassStatus({ type: 'error', msg: 'Password must be at least 6 characters.' });
      return;
    }

    setPassSaving(true);

    // 1. Update local credentials store for immediate offline/re-login sync
    updateFacultyCredentials(profile.name, {
      password: passwords.new,
      email: profile.email,
    });

    // 2. Persist to real Supabase database table 'faculty_schedules'
    const targetName = dbFacultyName || profile.name;
    const supabasePasswordPayload = {
      password: passwords.new,
      email: profile.email,
    };

    try {
      const { error: updateError } = await supabase
        .from('faculty_schedules')
        .update(supabasePasswordPayload)
        .eq('Faculty Name', targetName);

      if (updateError) {
        console.warn('Exact match password update failed, attempting ilike match:', updateError);
        await supabase
          .from('faculty_schedules')
          .update(supabasePasswordPayload)
          .ilike('Faculty Name', `%${profile.name}%`);
      }
    } catch (err) {
      console.error('Database password update error:', err);
    }

    setPassSaving(false);
    setProfile((prev) => ({ ...prev, password: passwords.new }));
    setPassStatus({ type: 'success', msg: 'Password updated successfully in database!' });
    setPasswords({ current: '', new: '', confirm: '' });
    setTimeout(() => setPassStatus({ type: '', msg: '' }), 3000);
  };

  const avatarUrl =
    profile.photo ||
    '/images/blank.jpg';

  return (
    <Layout isFaculty>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Faculty Profile</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage your faculty profile and information
          </p>
        </motion.div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm"
          >
            ✓ Profile saved successfully to database!
          </motion.div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <p className={`text-lg font-medium animate-pulse ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading profile details from Supabase...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left - Photo Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl border overflow-hidden ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-lg'
              }`}
            >
              <div className="h-20 bg-gradient-to-r from-green-600 to-emerald-700" />
              <div className="px-5 pb-5 -mt-10">
                <div className="relative w-20 h-20 mb-4">
                  <img
                    src={avatarUrl}
                    alt={profile.name}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/blank.jpg';
                    }}
                  />
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-600 rounded-xl flex items-center justify-center shadow hover:bg-green-700 transition-colors">
                    <Camera size={12} className="text-white" />
                  </button>
                </div>
                <h2 className={`font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{profile.name}</h2>
                <p className="text-green-600 text-sm font-medium">{profile.designation}</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{profile.department}</p>
                <div className={`mt-3 p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                  <p className="text-xs text-gray-400">Cabin</p>
                  <p className="font-bold text-green-600">Cabin {profile.cabin}</p>
                </div>
                <div className={`mt-2 p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <p className="text-xs text-gray-400">Qualification</p>
                  <p className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {profile.qualification}
                  </p>
                </div>
                <button
                  onClick={() => setEditing(!editing)}
                  className={`w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Edit3 size={14} /> {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </motion.div>

            {/* Right - Info */}
            <div className="lg:col-span-2 space-y-4">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Contact Information</h3>
                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Cabin No.
                      </label>
                      <input
                        type="text"
                        value={profile.cabin}
                        onChange={(e) => setProfile({ ...profile, cabin: e.target.value })}
                        className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-green-500'
                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-green-500'
                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Office Hours
                      </label>
                      <input
                        type="text"
                        value={profile.officeHours}
                        onChange={(e) => setProfile({ ...profile, officeHours: e.target.value })}
                        className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-green-500'
                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500'
                        }`}
                      />
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Profile
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      { icon: Mail, label: 'Email', value: profile.email, color: 'text-green-500' },
                      { icon: Clock, label: 'Office Hours', value: profile.officeHours, color: 'text-purple-500' },
                      { icon: MapPin, label: 'Cabin', value: `Cabin ${profile.cabin}`, color: 'text-red-500' },
                    ].map(({ icon: Icon, label, value, color }) => (
                      <div
                        key={label}
                        className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <Icon size={16} className={`${color} flex-shrink-0`} />
                        <div>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Subjects */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <BookOpen size={16} className="text-green-600" /> Subjects Taught
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.subjects.map((subject, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 text-sm bg-green-100 text-green-700 px-3 py-1.5 rounded-xl font-medium"
                    >
                      📚 {subject}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Change Password */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Change Password</h3>
                {passStatus.msg && (
                  <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${passStatus.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                    {passStatus.type === 'error' ? '⚠️ ' : '✓ '} {passStatus.msg}
                  </div>
                )}
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    required
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-green-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500'
                    }`}
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    required
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-green-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500'
                    }`}
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    required
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-green-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={passSaving}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {passSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                    Update Password
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FacultyProfilePage;