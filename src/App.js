import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Archive from './pages/Archive';
import Article from './components/Article';
import Tags from './pages/Tags';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/tags/:tag" element={<Tags />} />
        <Route path="/article/:url" component={Article} />
      </Routes>
    </Router>
  );
}

export default App;
