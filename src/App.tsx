import React from 'react';
import {Routes, Route} from "react-router-dom"

import Goban from "./components/Goban"
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Goban/>} />
      </Routes>
    </div>
  );
}

export default App;
