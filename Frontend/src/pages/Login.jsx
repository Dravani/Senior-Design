import React, { useState } from "react";
import "./Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Log In</h2>
        <label>Email Address</label>
        <input className="EmailInput"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
        
        <label>Password</label>
        <input className="PassInput"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
        <p>New User? <a href="/signup">Sign Up Here</a></p>
        <button className="auth-button">Log In</button>
      </div>
    </div>
  );
};

export default Login;
