import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Star, Send, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';

const Feedback: React.FC = () => {
  const { isDark } = useTheme();
  const [form, setForm] = useState({ name: '', email: '', category: 'Navigation', message: '', rating: 0 });
  const [submitted, setSubmitted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [loading, setLoading] = useState(false);

  const categories = ['Navigation', 'Faculty Directory', 'Classroom Finder', 'Emergency Services', 'App Interface', 'Other'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      // Save to localStorage
      const feedbacks = JSON.parse(localStorage.getItem('campusFeedbacks') || '[]');
      feedbacks.push({ ...form, date: new Date().toISOString() });
      localStorage.setItem('campusFeedbacks', JSON.stringify(feedbacks));
    }, 1500);
  };

  const handleReset = () => {
    setForm({ name: '', email: '', category: 'Navigation', message: '', rating: 0 });
    setSubmitted(false);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Feedback</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Help us improve Campus Connect</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-lg'}`}>
                {/* Top Banner */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6">
                  <h2 className="text-white font-bold text-lg">Share Your Experience</h2>
                  <p className="text-green-100 text-sm mt-1">Your feedback helps us build a better campus experience at S.B. Jain Institute</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Name & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your full name"
                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-green-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500 focus:bg-white'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="your@email.com"
                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-green-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500 focus:bg-white'}`}
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Feedback Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    >
                      {categories.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Star Rating */}
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Overall Rating <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => setForm({ ...form, rating: star })}
                          className="transition-transform hover:scale-125"
                        >
                          <Star
                            size={32}
                            className={`transition-colors ${
                              star <= (hoveredStar || form.rating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : isDark ? 'text-gray-600' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                      {form.rating > 0 && (
                        <span className={`text-sm font-medium ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about your experience with Campus Connect..."
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-green-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500 focus:bg-white'}`}
                    />
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{form.message.length}/500 characters</p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || !form.rating}
                    className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                      loading || !form.rating
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Submit Feedback
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-3xl border p-10 text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-lg'}`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle size={40} className="text-green-600" />
              </motion.div>
              <h2 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Thank You! 🎉</h2>
              <p className={`mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Your feedback has been submitted successfully.
              </p>
              <p className={`text-sm mb-6 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                We appreciate your input, <strong>{form.name}</strong>! It helps us improve Campus Connect.
              </p>
              <div className="flex items-center justify-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={20} className={s <= form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                ))}
              </div>
              <button
                onClick={handleReset}
                className="btn-primary inline-flex items-center gap-2"
              >
                <MessageSquare size={16} /> Submit Another
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Feedback;
