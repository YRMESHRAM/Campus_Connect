// React import not needed in React 17+ JSX transform
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence } from 'framer-motion';

// Pages
import Splash from './pages/Splash';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CampusMap from './pages/CampusMap';
import ClassroomFinder from './pages/ClassroomFinder';
import FacultyDirectory from './pages/FacultyDirectory';
import FacultyProfile from './pages/FacultyProfile';
import Emergency from './pages/Emergency';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import FacultyLogin from './pages/FacultyLogin';
import FacultyDashboard from './pages/FacultyDashboard';
import FacultyProfilePage from './pages/FacultyProfilePage';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Splash & Home */}
            <Route path="/" element={<Splash />} />
            <Route path="/home" element={<Home />} />

            {/* Student / Visitor Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/campus-map" element={<CampusMap />} />
            <Route path="/classroom-finder" element={<ClassroomFinder />} />
            <Route path="/faculty-directory" element={<FacultyDirectory />} />
            <Route path="/faculty/:id" element={<FacultyProfile />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />

            {/* Faculty Routes */}
            <Route path="/faculty-login" element={<FacultyLogin />} />
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/profile" element={<FacultyProfilePage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </ThemeProvider>
  );
}