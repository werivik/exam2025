import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import AnimatedRoutes from './AnimatedRoutes';

import './index.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className={`pageContentWrapper ${isSidebarOpen ? 'testBlurred' : ''}`}>
        <div className="pageContent">
          <main>
            <AnimatedRoutes />
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
