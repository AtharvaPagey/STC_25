// src/components/Auth/Login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axiosInstance";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      // send ID token to backend to login/register and get accessToken
      const res = await api.post(
        "/users/login",
        {},
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      const accessToken =
        res?.data?.data?.accessToken ||
        res?.data?.accessToken ||
        res?.data?.accessToken;
      if (accessToken) {
        localStorage.setItem("ACCESS_TOKEN", accessToken);
      }
      nav("/dashboard");
    } catch (e) {
      console.error(e);
      setErr(e.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <form onSubmit={submit} className="space-y-4">
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
            Login
          </button>
        </form>
        {err && <p className="text-red-600 mt-2">{err}</p>}
        <p className="mt-4 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-600">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
