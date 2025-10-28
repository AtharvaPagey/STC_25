// src/components/Dashboard/ProfileDropdown.jsx
import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function ProfileDropdown({ user }) {
  const nav = useNavigate();

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("ACCESS_TOKEN");
      nav("/login");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <img src="/npc-avatar.png" alt="npc" className="avatar" />
      <div className="text-sm">
        <div className="font-semibold">
          {user.displayName || user.email.split("@")[0]}
        </div>
        <div className="text-xs text-slate-500">{user.email}</div>
      </div>
      <button
        onClick={logout}
        className="ml-4 bg-red-500 text-white px-3 py-1 rounded"
      >
        Logout
      </button>
    </div>
  );
}
