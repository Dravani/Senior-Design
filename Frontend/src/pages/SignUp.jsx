import React, { useState } from "react";
import "./Auth.css";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Sign Up</h2>
        <label>Email Address</label>
        <input className="EmailInput"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
        
        <label>Username</label>
        <input className="EmailInput"
          type="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
        />

        <label>Password</label>
        <input className="EmailInput"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />

        <label>Verify Password</label>
        <input className="SignUpPass"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Enter your password"
        />
        <button className="auth-button">Register</button>
      </div>
    </div>
  );
};

export default SignUp;
