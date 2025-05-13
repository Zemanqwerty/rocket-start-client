import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Controller from './components/Controller';
import Rocket from './components/Rocket';
import './styles.css';

const App: React.FC = () => {
  return (
    <Router>
      <nav>
        <ul>
          <li>
            <Link to="/controller">Controller</Link>
          </li>
          <li>
            <Link to="/rocket">Rocket</Link>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/controller" element={<Controller />} />
        <Route path="/rocket" element={<Rocket />} />
      </Routes>
    </Router>
  );
};

export default App;