import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import AdminPanel from './pages/AdminPanel';
import MyListings from './pages/MyListings';
import MyClaims from './pages/MyClaims';
import Payment from './pages/Payment';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyOTP from './pages/VerifyOTP';
import ContactUs from './pages/ContactUs';
import ReportIssue from './pages/ReportIssue';
import PostSuccess from './pages/PostSuccess';
import Profile from './pages/Profile';
import AboutUs from './pages/AboutUs';



function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/report" element={<ReportIssue />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/my-claims" element={<MyClaims />} />
        <Route path="/payment/:id" element={<Payment />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/post-success" element={<PostSuccess />} />
      </Routes>
    </Router>
  );
}

export default App;