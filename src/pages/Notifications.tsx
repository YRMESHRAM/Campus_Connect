import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import notificationsData from '../data/notifications.json';

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  announcement: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  faculty: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  emergency: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  event: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
};

const Notifications: React.FC = () => {
  const { isDark } = useTheme();
  const [notifications, setNotifications] = useState(notificationsData);
  const [filter, setFilter] = useState('all');

  const markAllRead = () => setNotifications((n) => n.map((notif) => ({ ...notif, isRead: true })));
  const filters = ['all', 'announcement', 'faculty', 'emergency', 'event'];
  const filtered = filter === 'all' ? notifications : notifications.filter((n) => n.type === filter);
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center">
              <Bell size={20} className="text-white" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">{unread}</span>
              )}
            </div>
            <div>
              <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{unread} unread</p>
            </div>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-green-600 font-medium hover:text-green-700">
              <CheckCheck size={16} /> Mark all read
            </button>
          )}
        </motion.div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-green-600 text-white'
                  : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filtered.map((notif, i) => {
            const Icon = Bell;
            const colors = typeColors[notif.type] || typeColors.announcement;

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setNotifications((ns) => ns.map((n) => n.id === notif.id ? { ...n, isRead: true } : n))}
                className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                  !notif.isRead
                    ? isDark ? 'bg-green-900/20 border-green-800/50 hover:bg-green-900/30' : 'bg-green-50/60 border-green-200 hover:bg-green-50'
                    : isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 shadow-sm hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
                    <Icon size={18} className={colors.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-semibold text-sm leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{notif.title}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notif.isRead && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                      </div>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{notif.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                        {notif.type}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{notif.time}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Bell size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No notifications</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
