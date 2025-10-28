// src/components/Dashboard/NewTreatmentSlide.jsx
import React, { useState } from "react";

export default function NewTreatmentSlide({ onClose, onSubmit }) {
  const [symptoms, setSymptoms] = useState("");
  const [travelHistory, setTravelHistory] = useState("");
  const [foods, setFoods] = useState(["", "", "", "", ""]);

  const setFood = (i, v) => {
    const copy = [...foods];
    copy[i] = v;
    setFoods(copy);
  };

  const submit = () => {
    if (!symptoms.trim()) {
      alert("Please add symptoms");
      return;
    }
    onSubmit({ symptoms, travelHistory, dailyData: foods });
  };

  return (
    <div className="slide-overlay">
      <div className="slide-panel">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">New Treatment</h3>
          <button onClick={onClose} className="text-slate-600">
            Close
          </button>
        </div>

        <label className="block text-sm font-medium">Symptoms</label>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className="w-full border p-2 rounded mb-3"
          rows={4}
        />

        <label className="block text-sm font-medium">Travel history</label>
        <textarea
          value={travelHistory}
          onChange={(e) => setTravelHistory(e.target.value)}
          className="w-full border p-2 rounded mb-3"
          rows={2}
        />

        <div className="grid grid-cols-1 gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i}>
              <label className="text-sm">Food (Day {i + 1})</label>
              <input
                value={foods[i]}
                onChange={(e) => setFood(i, e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
          ))}
        </div>

        <div className="mt-4">
          <button
            onClick={submit}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
