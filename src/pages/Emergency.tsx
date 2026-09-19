import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, Shield, Heart, Flame, Building, Navigation, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import emergencyData from '../data/emergency.json';
import { useNavigate } from 'react-router-dom';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  shield: Shield,
  phone: Phone,
  heart: Heart,
  flame: Flame,
  building: Building,
};

const colorMap: Record<string, { gradient: string; bg: string; border: string; iconBg: string }> = {
  security: { gradient: 'from-blue-600 to-blue-800', bg: 'from-blue-50 to-blue-100/50', border: 'border-blue-200', iconBg: 'from-blue-500 to-blue-700' },
  reception: { gradient: 'from-green-600 to-green-800', bg: 'from-green-50 to-green-100/50', border: 'border-green-200', iconBg: 'from-green-500 to-green-700' },
  medical: { gradient: 'from-red-500 to-red-700', bg: 'from-red-50 to-red-100/50', border: 'border-red-200', iconBg: 'from-red-500 to-red-700' },
  fire: { gradient: 'from-orange-500 to-orange-700', bg: 'from-orange-50 to-orange-100/50', border: 'border-orange-200', iconBg: 'from-orange-500 to-orange-700' },
  admin: { gradient: 'from-purple-500 to-purple-700', bg: 'from-purple-50 to-purple-100/50', border: 'border-purple-200', iconBg: 'from-purple-500 to-purple-700' },
};

const darkColorMap: Record<string, { bg: string; border: string }> = {
  security: { bg: 'from-blue-900/30 to-blue-800/20', border: 'border-blue-800/50' },
  reception: { bg: 'from-green-900/30 to-green-800/20', border: 'border-green-800/50' },
  medical: { bg: 'from-red-900/30 to-red-800/20', border: 'border-red-800/50' },
  fire: { bg: 'from-orange-900/30 to-orange-800/20', border: 'border-orange-800/50' },
  admin: { bg: 'from-purple-900/30 to-purple-800/20', border: 'border-purple-800/50' },
};

const Emergency: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center animate-pulse">
              <Phone size={20} className="text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Emergency Contacts</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Quick access to all emergency services on campus</p>
            </div>
          </div>
        </motion.div>

        {/* Emergency Alert Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-4 mb-6 flex items-center gap-4"
        >
          <div className="text-2xl animate-pulse">🚨</div>
          <div>
            <p className="text-white font-bold">In case of emergency</p>
            <p className="text-red-200 text-sm">Call the appropriate contact below. For life-threatening emergencies, call 112.</p>
          </div>
          <a href="tel:112" className="ml-auto bg-white text-red-700 font-bold px-4 py-2 rounded-xl flex items-center gap-2 text-sm whitespace-nowrap hover:bg-red-50 transition-colors">
            <Phone size={14} /> Call 112
          </a>
        </motion.div>

        {/* Emergency Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {emergencyData.map((contact, i) => {
            const Icon = iconMap[contact.icon] || Shield;
            const colors = colorMap[contact.type] || colorMap.admin;
            const darkColors = darkColorMap[contact.type] || darkColorMap.admin;

            return (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.01 }}
                className={`rounded-3xl border overflow-hidden transition-all duration-300 ${
                  isDark
                    ? `bg-gradient-to-br ${darkColors.bg} ${darkColors.border} hover:shadow-xl`
                    : `bg-gradient-to-br ${colors.bg} ${colors.border} hover:shadow-xl`
                }`}
              >
                {/* Card Top */}
                <div className={`p-5 bg-gradient-to-r ${colors.gradient} relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="flex items-center gap-3 relative">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Icon size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-black text-lg">{contact.name}</h3>
                      <span className="text-white/70 text-xs">{contact.available}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <p className={`text-sm mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {contact.description}
                  </p>

                  <div className={`flex items-center gap-2 text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <MapPin size={14} className="text-green-500 flex-shrink-0" />
                    {contact.location}
                  </div>
                  <div className={`flex items-center gap-2 text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Clock size={14} className="text-blue-500 flex-shrink-0" />
                    {contact.available}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${contact.phone}`}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r ${colors.gradient} text-white hover:opacity-90 transition-opacity`}
                    >
                      <Phone size={14} /> Call Now
                    </a>
                    <button
                      onClick={() => navigate('/campus-map')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'}`}
                    >
                      <Navigation size={14} /> Location
                    </button>
                  </div>

                  {/* Alternate Phone */}
                  <div className={`mt-3 text-center text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Alternate: <a href={`tel:${contact.alternatePhone}`} className="text-green-600 font-medium hover:underline">{contact.alternatePhone}</a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Dial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`mt-8 p-6 rounded-2xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}
        >
          <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>📞 Quick Dial Numbers</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'National Emergency', number: '112', color: 'from-red-500 to-red-700' },
              { label: 'Ambulance', number: '108', color: 'from-red-400 to-orange-600' },
              { label: 'Fire Brigade', number: '101', color: 'from-orange-500 to-orange-700' },
              { label: 'Police', number: '100', color: 'from-blue-500 to-blue-700' },
            ].map(({ label, number, color }) => (
              <a
                key={number}
                href={`tel:${number}`}
                className={`flex flex-col items-center p-4 rounded-2xl bg-gradient-to-br ${color} text-white hover:opacity-90 transition-opacity group`}
              >
                <span className="text-2xl font-black mb-1">{number}</span>
                <span className="text-xs text-white/80 text-center">{label}</span>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Emergency;
