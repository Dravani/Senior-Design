import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from 'react-router-dom';
import "./Auth.css";

const SignUp = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!email || !username || !password) {
      alert("Please fill in all fields.");
      return;
    }
    console.log("Sending to Supabase:", {
      username,
      password,
      role: "user"
    });
    const { data, error } = await supabase
      .from("users")
      .insert([{ email, username, password, role: "user" }]);

    if (error) {
        console.error("Signup Error:", error);
        alert("Sign up failed: " + (error.message || "Check console for details"));
        return;
    } else {
      alert("Sign up successful!");
      navigate("/login"); 
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Sign Up</h2>
        <label>Email Address</label>
        <input
          className="EmailInput"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />

        <label>Username</label>
        <input
          className="EmailInput"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
        />

        <label>Password</label>
        <input
          className="EmailInput"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />

        <label>Verify Password</label>
        <input
          className="SignUpPass"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Enter your password"
        />

        <button className="auth-button" onClick={handleRegister}>
          Register
        </button>
      </div>
    </div>
  );
};

export default SignUp;
