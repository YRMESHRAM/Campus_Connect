import React from 'react';
import { motion } from 'framer-motion';
import { UserX, LogIn, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';

import FacultyProfilePage from './FacultyProfilePage';

const Profile: React.FC = () => {
  const { isDark } = useTheme();

  if (localStorage.getItem('facultyLoggedIn') === 'true') {
    return <FacultyProfilePage />;
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 ${
            isDark ? 'bg-gray-800' : 'bg-gray-100'
          }`}
        >
          <UserX size={44} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className={`text-2xl font-black mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No Profile Yet
          </h1>
          <p className={`mb-8 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            You're browsing as a guest. Profile features are available for registered faculty members.
            Visitors and students can freely explore the campus without signing in.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/faculty-login"
              className="btn-primary flex items-center justify-center gap-2 px-6 py-3"
            >
              <LogIn size={18} /> Faculty Login
            </Link>
            <Link
              to="/dashboard"
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold border-2 transition-all ${
                isDark
                  ? 'border-gray-700 text-gray-300 hover:border-green-500 hover:text-green-400'
                  : 'border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600'
              }`}
            >
              <Users size={18} /> Explore Campus
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;