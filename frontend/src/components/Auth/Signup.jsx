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
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      // Frontend validation
      if (!email || !password || !fullName || !username) {
        throw new Error("All fields are required");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      console.log("1. Creating Firebase user...");
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ Firebase user created:", cred.user.uid);

      console.log("2. Updating profile...");
      await updateProfile(cred.user, { displayName: fullName });
      console.log("✅ Profile updated");

      console.log("3. Getting ID token...");
      const idToken = await cred.user.getIdToken();
      console.log(
        "✅ Got ID token (first 50 chars):",
        idToken.substring(0, 50) + "..."
      );

      console.log("4. Sending to backend with payload:", {
        age: null,
        username,
        fullName,
        gender: null,
      });

      const res = await api.post(
        "/users/login",
        {
          age: null,
          username,
          fullName,
          gender: null,
        },
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      console.log("✅ Backend response:", res.data);

      const accessToken =
        res?.data?.data?.accessToken || res?.data?.accessToken;

      if (accessToken) {
        localStorage.setItem("ACCESS_TOKEN", accessToken);
        console.log("✅ Token stored");
      }

      nav("/dashboard");
    } catch (e) {
      console.error("❌ FULL ERROR:", e);
      console.error("❌ Error response:", e.response);
      console.error("❌ Error response data:", e.response?.data);

      // Parse error
      let errorMessage = "Signup failed";

      if (e.code) {
        // Firebase error
        switch (e.code) {
          case "auth/email-already-in-use":
            errorMessage =
              "This email is already registered. Try logging in instead.";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email format.";
            break;
          case "auth/weak-password":
            errorMessage = "Password is too weak. Use at least 6 characters.";
            break;
          default:
            errorMessage = e.message || "Firebase signup failed";
        }
      } else if (e.response) {
        // Backend error
        const backendMsg = e.response?.data?.message || e.response?.data?.error;
        errorMessage = `Backend error: ${backendMsg || e.message}`;
        console.error("Backend returned:", e.response.status, backendMsg);
      } else {
        // Network or other error
        errorMessage = e.message || "Network error";
      }

      setErr(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
              placeholder="john@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Password{" "}
              <span className="text-xs text-gray-500">(min 6 characters)</span>
            </label>
            <input
              className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        {err && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600 text-sm">{err}</p>
          </div>
        )}
        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
