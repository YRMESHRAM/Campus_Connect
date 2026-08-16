import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import { fetchFacultyFromSupabase, getCachedFacultyData, verifyFacultyPassword, getFacultyCredentials } from '../utils/facultyStore';

const FacultyLogin: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', remember: false });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const inputName = form.username.trim();

    try {
      let data: any = null;

      try {
        const { data: results, error: supabaseError } = await supabase
          .from('faculty_schedules')
          .select('*')
          .or(`Faculty Name.ilike.%${inputName}%,email.ilike.%${inputName}%`);

        if (!supabaseError && results && results.length > 0) {
          data = results[0];
        }
      } catch (err) {
        // Ignore Supabase query error
      }

      if (!data) {
        // Check by exact or partial ilike on Faculty Name
        try {
          const { data: results } = await supabase
            .from('faculty_schedules')
            .select('*')
            .ilike('Faculty Name', `%${inputName}%`);
          if (results && results.length > 0) data = results[0];
        } catch (_) {}
      }

      // If Supabase query failed or returned no match, check cached Supabase list
      if (!data) {
        const list = getCachedFacultyData().length > 0 ? getCachedFacultyData() : await fetchFacultyFromSupabase();
        const found = list.find((f) => {
          const n = f["Faculty Name"] || f.name || '';
          const e = f.email || '';
          return n.toLowerCase().includes(inputName.toLowerCase()) || (e && e.toLowerCase() === inputName.toLowerCase());
        });

        if (found) {
          data = found;
        } else if (inputName.length > 2) {
          // Allow login for custom faculty names if entered
          data = {
            'Faculty Name': inputName,
            'Department': 'Computer Science & Engineering',
            'Cabin No.': 'Cabin A-101',
            designation: 'Faculty Member',
            isHOD: false,
          };
        }
      }

      setLoading(false);

      if (!data) {
        setError('Invalid faculty username or email.');
        return;
      }

      const matchedName = data['Faculty Name'] || inputName;
      const validPassword = verifyFacultyPassword(matchedName, form.password, data.password);

      if (!validPassword) {
        setError('Invalid password.');
        return;
      }

      const creds = getFacultyCredentials(matchedName);
      const savedEmail = creds.email || data.email || `${matchedName.toLowerCase().replace(/[^a-z]/g, '')}@sbjain.edu.in`;

      localStorage.setItem('facultyLoggedIn', 'true');
      localStorage.setItem('facultyName', matchedName);
      localStorage.setItem('facultyEmail', savedEmail);
      localStorage.setItem('facultyDepartment', creds.department || data['Department'] || 'Computer Science & Engineering');
      localStorage.setItem('facultyCabin', creds.cabin || data['Cabin No.'] || 'Cabin A-101');
      localStorage.setItem('facultyDesignation', creds.designation || data.designation || 'Faculty Member');
      localStorage.setItem('facultyIsHOD', data.isHOD ? 'true' : 'false');

      if (form.remember) localStorage.setItem('rememberedFaculty', inputName);
      navigate('/faculty/dashboard');
    } catch (err) {
      setLoading(false);
      setError('An error occurred during login.');
    }
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Left Panel - Campus Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="/images/campus.jpg" alt="SB Jain Campus" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 to-blue-900/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-10">
          <img src="/images/logo.png" alt="Logo" className="w-24 h-24 object-contain mb-6 drop-shadow-2xl" />
          <h1 className="text-4xl font-black mb-3">Faculty Portal</h1>
          <p className="text-green-200 text-center text-lg mb-6">
            Campus Connect — Smart Navigation System
          </p>
          <img src="/images/banner.jpg" alt="Banner" className="w-full max-w-sm rounded-2xl opacity-60 shadow-2xl" />
          <div className="mt-6 text-center">
            <p className="text-white font-semibold text-lg">S.B. Jain Institute</p>
            <p className="text-green-200 text-sm">of Technology, Management & Research</p>
            <p className="text-green-300 text-xs mt-1">An Autonomous Institute | Affiliated to R.T.M. Nagpur University</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className={`flex-1 flex flex-col items-center justify-center px-6 py-10 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        {/* Top Navigation */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link to="/home" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <button onClick={toggleTheme} className={`p-2 rounded-xl ${isDark ? 'text-yellow-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo (Mobile) */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img src="/images/logo.png" alt="Logo" className="w-20 h-20 object-contain mb-3" />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>S.B. Jain Institute</h2>
          </div>

          {/* Form Card */}
          <div className={`rounded-3xl border p-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-xl'}`}>
            <div className="mb-6">
              <h1 className={`text-2xl font-black mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Faculty Login</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Sign in to access your faculty dashboard</p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4"
              >
                ⚠️ {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Faculty Username
                </label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Enter your name (e.g., Dr. Rajesh Sharma)"
                  className={`w-full px-4 py-3.5 rounded-xl border text-sm outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-green-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500 focus:bg-white'}`}
                />
              </div>

              {/* Password */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Pass@123"
                    className={`w-full px-4 py-3.5 rounded-xl border text-sm outline-none pr-12 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-green-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500 focus:bg-white'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                    className="w-4 h-4 rounded text-green-600"
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Remember me</span>
                </label>
                <button type="button" className="text-sm text-green-600 font-medium hover:text-green-700">
                  Forgot password?
                </button>
              </div>

              {/* Default Credentials Hint */}
              <div className={`p-3 rounded-xl text-xs ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-blue-50 text-blue-700'}`}>
                <strong>Default credentials:</strong> Username = Your Name | Password = <code className="font-mono font-bold">Pass@123</code>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5'}`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In to Faculty Portal
                  </>
                )}
              </button>
            </form>
          </div>

          <p className={`text-center text-xs mt-6 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            Student? <Link to="/dashboard" className="text-green-600 font-medium">Explore campus →</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default FacultyLogin;