import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

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

import './index.css'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <div className={`pageContent ${isSidebarOpen ? 'testBlurred' : ''}`}>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/hotel-details" element={<HotelDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login-costumer" element={<LoginCostumer />} />
            <Route path="/login-admin" element={<LoginAdmin />} />
            <Route path="/register-costumer" element={<RegisterCostumer />} />
            <Route path="/register-admin" element={<RegisterAdmin />} />
            <Route path="/costumer-profile" element={<CostumerProfile />} />
            <Route path="/admin-profile" element={<AdminProfile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App; 