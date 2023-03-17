import React from 'react';
import { BrowserRouter , Route, Routes } from 'react-router-dom';
import "./Styles/main.scss";

import Navigation from './Pages/Navigation/Navigation';
import Home from './Pages/Home.jsx';
import Authentication from './Pages/Authentication/Authentication';
import User from './Pages/UserPage/User.jsx';
import Stats from './Pages/StatPage/Stats.jsx';
import Game from './Pages/GamePage/Game.jsx';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navigation/>
        <Routes>
          <Route exact path="/" element={<Home/>}/>
          <Route path="/Authentication" element={<Authentication/>}/>
          <Route path="/User" element={<User/>}/>
          <Route path="/Stats" element={<Stats/>}/>
          <Route path="/Game" element={<Game/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
