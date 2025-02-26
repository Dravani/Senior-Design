import React from 'react';
import { BrowserRouter, Routes, Route, Router } from 'react-router-dom';

// pages
import UserSensorHub from './pages/UserSensorHub'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/sensors"
          element={<UserSensorHub/>}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
