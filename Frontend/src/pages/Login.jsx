import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter both fields.");
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("username, password, role")
      .eq("username", username)
      .single();

    console.log("Login data:", data);
    console.log("Login error:", error);

    if (error || !data || data.password !== password) {
      alert("Invalid username or password.");
    } else {
      alert(`Welcome back, ${data.username}!`);
      sessionStorage.setItem("currentUser", JSON.stringify(data));
      navigate("/projects");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Log In</h2>

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
          className="PassInput"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />

        <p>
          New User? <a href="/signup">Sign Up Here</a>
        </p>
        <button className="auth-button" onClick={handleLogin}>
          Log In
        </button>
      </div>
    </div>
  );
};

export default Login;
