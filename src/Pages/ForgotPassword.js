import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../Config";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("${API_BASE_URL}/forgot-password", { email })
      .then(res => setMessage(res.data.message))
      .catch(err => setMessage(err.response?.data?.error || "Error"));
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>🔄 Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} required />
        <button type="submit">Send Reset Link</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ForgotPassword;
