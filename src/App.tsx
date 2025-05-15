import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Controller from './components/controller';
import Rocket from './components/rocket/Rocket';
import './styles.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/controller" element={<Controller />} />
        <Route path="/rocket" element={<Rocket />} />
      </Routes>
    </Router>
  );
};

export default App;