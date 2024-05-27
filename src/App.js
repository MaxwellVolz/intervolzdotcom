import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Article from './components/Article';

import Home from './pages/Home';
import Archive from './pages/Archive';
import Tags from './pages/Tags';

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Hero />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/tags/:tag" element={<Tags />} />
          <Route path="/article/:url" element={<Article />} />
        </Routes>
      </div>

    </Router>
  );
}

export default App;
