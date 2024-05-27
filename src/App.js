import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Article from './components/Article';

import Home from './pages/Home';
import Archive from './pages/Archive';
import About from './pages/About';
import Tags from './pages/Tags';

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/about" element={<About />} />
          <Route path="/tags/:tag" element={<Tags />} />
          <Route path="/articles/:url" element={<Article />} />
        </Routes>
      </div>

    </Router>
  );
}

export default App;
