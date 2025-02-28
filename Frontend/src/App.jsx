import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import UserSensorHub from './pages/UserSensorHub'
import UserProjectHub from './pages/UserProjectHub';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login"
          element={<Login />}
        />
        <Route 
          path="/signup"
          element={<SignUp />}
        />
        <Route 
          path="/"
          element={<Login />} 
        />
        <Route
          path="/projects"
          element={<UserProjectHub/>}
        />
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
  );
}

export default App;
