import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./Settings.css";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [tempValue, setTempValue] = useState("");

  useEffect(() => {
    (async () => {
      const stored = sessionStorage.getItem("currentUser");
      if (!stored) {
        setError("No user logged in");
        setLoading(false);
        return;
      }
      const current = JSON.parse(stored);
      setUsername(current.username);
      setNotificationsEnabled(!!current.notifications);

      const { data, error: fetchError } = await supabase
        .from("users")
        .select("email")
        .eq("username", current.username)
        .single();

      if (fetchError) {
        setError("Failed to load email");
      } else {
        setEmail(data.email);
      }
      setLoading(false);
    })();
  }, []);

  const saveField = async () => {
    setError("");
    setMessage("");
    const updates = {};
    if (editing === "email") {
      if (!/^\S+@\S+\.\S+$/.test(tempValue)) {
        setError("Please enter a valid email");
        return;
      }
      updates.email = tempValue;
    } else if (editing === "username") {
      updates.username = tempValue;
    }

    const { error: updateError } = await supabase
      .from("users")
      .update(updates)
      .eq("username", username);

    if (updateError) {
      setError(updateError.message);
    } else {
      if (editing === "email") setEmail(tempValue);
      else setUsername(tempValue);

      const current = JSON.parse(sessionStorage.getItem("currentUser"));
      const newUser = { ...current, ...updates };
      sessionStorage.setItem("currentUser", JSON.stringify(newUser));

      setMessage("Updated successfully");
    }
    setEditing(null);
  };

  const handleCancel = () => {
    setEditing(null);
    setTempValue("");
  };

  const sendReset = async () => {
    setError("");
    setMessage("");
    const { error: passError } = await supabase.auth.resetPasswordForEmail(
      email
    );
    if (passError) setError(passError.message);
    else setMessage("Reset email sent");
  };

  if (loading) return <div className="settings">Loading...</div>;

  return (
    <div className="settings">
      <h1>Settings</h1>
      {error && <div className="error">{error}</div>}
      {message && <div className="message">{message}</div>}

      <div className="field-row">
        <label>Email:</label>
        {editing === "email" ? (
          <>
            <input
              type="email"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
            />
            <button onClick={saveField}>Save</button>
            <button className="cancel" onClick={handleCancel}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <span className="value">{email}</span>
            <button
              onClick={() => {
                setEditing("email");
                setTempValue(email);
              }}
            >
              Edit
            </button>
          </>
        )}
      </div>

      <div className="field-row">
        <label>Username:</label>
        {editing === "username" ? (
          <>
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
            />
            <button onClick={saveField}>Save</button>
            <button className="cancel" onClick={handleCancel}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <span className="value">{username}</span>
            <button
              onClick={() => {
                setEditing("username");
                setTempValue(username);
              }}
            >
              Edit
            </button>
          </>
        )}
      </div>

      <div className="field-row notifications-row">
        <label>Notifications:</label>
        <input
          type="checkbox"
          checked={notificationsEnabled}
          onChange={async (e) => {
            const newVal = e.target.checked;
            setNotificationsEnabled(newVal);
            const current = JSON.parse(
              sessionStorage.getItem("currentUser")
            );
            await supabase
              .from("users")
              .update({ notifications: newVal })
              .eq("username", current.username);
            current.notifications = newVal;
            sessionStorage.setItem(
              "currentUser",
              JSON.stringify(current)
            );
          }}
        />
      </div>

      <div className="password-section">
        <button onClick={sendReset}>Reset Password</button>
      </div>
    </div>
  );
}
