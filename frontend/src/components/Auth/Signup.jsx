// src/components/Auth/Signup.jsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axiosInstance";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // optional: set displayName
      await updateProfile(cred.user, { displayName: fullName });
      const idToken = await cred.user.getIdToken();
      // send token + optional fields to backend for registration
      const res = await api.post(
        "/users/login",
        {
          age: null,
          username,
          fullName,
        },
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      const accessToken =
        res?.data?.data?.accessToken || res?.data?.accessToken;
      if (accessToken) localStorage.setItem("ACCESS_TOKEN", accessToken);
      nav("/dashboard");
    } catch (e) {
      console.error(e);
      setErr(e.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>
        <form onSubmit={submit} className="space-y-3">
          <input
            className="w-full p-2 border rounded"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-indigo-600 text-white py-2 rounded">
            Create account
          </button>
        </form>
        {err && <p className="text-red-600 mt-2">{err}</p>}
        <p className="mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
