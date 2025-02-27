import React from 'react';
import { BrowserRouter, Routes, Route, Router } from 'react-router-dom';

// pages
//import UserSensorHub from './pages/UserSensorHub'
import Login from './pages/Login';
import SignUp from './pages/SignUp';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<SignUp/>}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
