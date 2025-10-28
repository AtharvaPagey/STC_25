// src/components/Admin/AdminFinetuneModal.jsx
import React, { useState } from "react";
import api from "../../api/axiosInstance";

export default function AdminFinetuneModal({ onClose }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadAndStart = async () => {
    if (!file) {
      alert("Select CSV");
      return;
    }
    setLoading(true);
    try {
      // We'll read CSV content and send as JSON array to backend (admin expects newData array)
      const text = await file.text();
      // naive CSV -> array of obj: here we'll send raw CSV string in body as 'csv' (backend expects array)
      // But your backend expects newData array; easiest: convert to lines
      const lines = text.split(/\r?\n/).filter(Boolean);
      // send as newData (simple)
      const res = await api.post("/admin/finetune-model", { newData: lines });
      alert("Finetune started");
      onClose();
    } catch (e) {
      console.error(e);
      alert("Error starting finetune");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="result-overlay" onClick={onClose}>
      <div className="result-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-2">Admin Finetune</h3>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <div className="mt-4 flex gap-2">
          <button
            onClick={uploadAndStart}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            Start
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded border">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
