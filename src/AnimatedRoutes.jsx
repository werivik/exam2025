import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Home from './pages/Home/Home';
import Hotels from './pages/Hotels/Hotels';
import HotelDetails from './pages/HotelDetails/HotelDetails';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import LoginCostumer from './pages/LoginCostumer/LoginCostumer';
import LoginAdmin from './pages/LoginAdmin/LoginAdmin';
import RegisterCostumer from './pages/RegisterCostumer/RegisterCostumer';
import RegisterAdmin from './pages/RegisterAdmin/RegisterAdmin';
import CostumerProfile from './pages/CostumerProfile/CostumerProfile';
import AdminProfile from './pages/AdminProfile/AdminProfile';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotel-details/:id" element={<HotelDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login-costumer" element={<LoginCostumer />} />
        <Route path="/login-admin" element={<LoginAdmin />} />
        <Route path="/register-costumer" element={<RegisterCostumer />} />
        <Route path="/register-admin" element={<RegisterAdmin />} />
        <Route path="/costumer-profile" element={<CostumerProfile />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
