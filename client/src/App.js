import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import PageLoader from './components/PageLoader';
import PageTransition from './components/PageTransition';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import MyListings from './pages/MyListings';
import MyClaims from './pages/MyClaims';
import AdminPanel from './pages/AdminPanel';
import Payment from './pages/Payment';
import ContactUs from './pages/ContactUs';
import ReportIssue from './pages/ReportIssue';
import PostSuccess from './pages/PostSuccess';
import Profile from './pages/Profile';
import AboutUs from './pages/AboutUs';

function AppContent() {
  return (
    <>
      <Navbar />
      <PageLoader />
      <PageTransition>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/my-claims" element={<MyClaims />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/payment/:id" element={<Payment />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/post-success" element={<PostSuccess />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<AboutUs />} />
        </Routes>
      </PageTransition>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;