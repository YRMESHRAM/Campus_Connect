import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Users, Phone, BookOpen, ArrowRight, Star, Shield, Zap, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  const features = [
    { icon: Navigation, title: 'Smart Navigation', desc: 'Interactive campus map with real-time indoor navigation and animated route overlays.' },
    { icon: BookOpen, title: 'Room & Lab Finder', desc: 'Instantly find classrooms, labs, and facilities with availability status.' },
    { icon: Users, title: 'Faculty Directory', desc: 'Browse all faculty with live availability — available, busy, or in lecture.' },
    { icon: Phone, title: 'Emergency SOS', desc: 'One-tap access to security, medical, fire safety, and administration contacts.' },
  ];

  const stats = [
    { label: 'Rooms & Labs', value: '100+' },
    { label: 'Faculty Members', value: '80+' },
    { label: 'Departments', value: '8' },
    { label: 'Campus Area', value: '25 Acres' },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      {/* Navbar for Home */}
      <nav className={`fixed top-0 left-0 right-0 z-50 nav-blur border-b ${isDark ? 'border-gray-800' : 'border-gray-100'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
            <div>
              <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Campus Connect</span>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>S.B. Jain Institute</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </button>
            <Link
              to="/faculty-login"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${isDark ? 'border border-green-600 text-green-400 hover:bg-green-900/30' : 'border border-green-600 text-green-600 hover:bg-green-50'}`}
            >
              Faculty Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Campus Building Background */}
        <div className="absolute inset-0">
          <img src="/images/campus.jpg" alt="SB Jain Campus" className="w-full h-full object-cover" />
          <div className={`absolute inset-0 ${isDark ? 'bg-gray-950/85' : 'bg-white/80'}`} />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/30 via-transparent to-blue-900/20" />
        </div>

        {/* Animated Blobs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-400/10 rounded-full blob-animate blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-400/10 rounded-full blob-animate blur-3xl" style={{ animationDelay: '3s' }} />

        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-6"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Smart Campus Navigation System
              </motion.div>

              <h1 className={`text-5xl md:text-7xl font-black leading-tight mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Campus
                <br />
                <span className="text-gradient">Connect</span>
              </h1>

              <p className={`text-lg md:text-xl mb-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Smart Indoor Navigation & Campus Management System
              </p>

              <p className={`text-sm mb-8 leading-relaxed max-w-md ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Navigate S.B. Jain Institute campus with ease. Find classrooms, labs, faculty cabins, and departments in real-time.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className={`text-center p-3 rounded-xl ${isDark ? 'bg-gray-800/60 border border-gray-700' : 'bg-white/80 border border-gray-200 shadow-sm'}`}
                  >
                    <div className="text-xl font-black text-green-600">{stat.value}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Link
                  to="/dashboard"
                  className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
                >
                  <Navigation size={20} />
                  Start Exploring
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/faculty-login"
                  className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg border-2 transition-all hover:-translate-y-1 ${isDark ? 'border-gray-700 text-gray-300 hover:border-green-500 hover:text-green-400' : 'border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600'}`}
                >
                  <Users size={20} />
                  Faculty Login
                </Link>
              </motion.div>
            </motion.div>

            {/* Right - College Banner & Logo Card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className={`rounded-3xl overflow-hidden shadow-2xl border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <img src="/images/banner.jpg" alt="SB Jain Banner" className="w-full h-auto object-contain bg-white" />
                <div className={`p-6 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <img src="/images/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
                    <div>
                      <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>S.B. Jain Institute</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>of Technology, Management & Research</p>
                      <span className="text-xs text-green-600 font-medium">An Autonomous Institute</span>
                    </div>
                  </div>

                  {/* Floating Feature Pills */}
                  <div className="flex flex-wrap gap-2">
                    {['Indoor Navigation', 'Real-time Faculty', 'Smart Search', 'Emergency SOS'].map((tag) => (
                      <span key={tag} className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Navigation Icons */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { icon: MapPin, label: 'Location', color: 'from-green-500 to-emerald-600' },
                  { icon: Navigation, label: 'Navigate', color: 'from-blue-500 to-blue-700' },
                  { icon: Shield, label: 'Safety', color: 'from-red-500 to-red-700' },
                ].map(({ icon: Icon, label, color }, i) => (
                  <motion.div
                    key={label}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}
                  >
                    <Icon size={24} />
                    <span className="text-xs font-semibold">{label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={`text-3xl md:text-4xl font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Everything You Need to{' '}
              <span className="text-gradient">Navigate Campus</span>
            </h2>
            <p className={`max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              A comprehensive digital campus companion designed for students, visitors, and faculty of S.B. Jain Institute.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`card-hover p-6 rounded-2xl border ${isDark ? 'bg-gray-800 border-gray-700 hover:border-green-600/50' : 'bg-white border-gray-200 hover:border-green-300 shadow-sm'}`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/25">
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Campus Section */}
      <section className={`py-20 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img src="/images/campus.jpg" alt="S.B. Jain Campus Building" className="w-full h-80 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl">
                    S.B. Jain Campus, Nagpur
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Star size={14} />
                About the Institute
              </div>
              <h2 className={`text-3xl md:text-4xl font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                S.B. Jain Institute of Technology, Management & Research
              </h2>
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                An Autonomous Institute affiliated to R.T.M. Nagpur University, offering cutting-edge engineering, management, and research programs in a 25-acre green campus.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { icon: Zap, label: 'Established 2008' },
                  { icon: Shield, label: 'NAAC Accredited' },
                  { icon: Users, label: '2000+ Students' },
                  { icon: Clock, label: '24/7 Campus Access' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className={`flex items-center gap-2 p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <Icon size={16} className="text-green-600 flex-shrink-0" />
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
                  </div>
                ))}
              </div>
              <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
                Explore Campus <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-green-700 via-green-800 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blob-animate blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-green-300/10 rounded-full blob-animate blur-3xl" />
        </div>
        <motion.div
          className="relative max-w-3xl mx-auto text-center px-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <img src="/images/logo.png" alt="Logo" className="w-16 h-16 object-contain mx-auto mb-6 drop-shadow-lg" />
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to Navigate Smarter?</h2>
          <p className="text-green-200 mb-8 text-lg">
            Join thousands of students and faculty using Campus Connect at S.B. Jain Institute.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/dashboard" className="bg-white text-green-700 font-bold px-8 py-4 rounded-xl hover:bg-green-50 transition-all hover:-translate-y-1 flex items-center gap-2 text-lg shadow-lg">
              <Navigation size={20} /> Start Exploring
            </Link>
            <Link to="/faculty-login" className="border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
              <Users size={20} /> Faculty Portal
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
