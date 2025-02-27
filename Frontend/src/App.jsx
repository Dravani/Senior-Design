import React from 'react';
import { BrowserRouter, Routes, Route, Router } from 'react-router-dom';

// pages
import UserSensorHub from './pages/UserSensorHub'
import UserProjectHub from './pages/UserProjectHub';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/sensors"
          element={<UserSensorHub/>}
        />
        <Route
          path="/projects"
          element={<UserProjectHub/>}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
