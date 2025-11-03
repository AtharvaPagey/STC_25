import React, { useState } from "react";

export default function NewTreatmentSlide({ onClose, onSubmit }) {
  const [symptoms, setSymptoms] = useState("");
  const [travelHistory, setTravelHistory] = useState("");
  const [occupation, setOccupation] = useState("");
  const [foods, setFoods] = useState(["", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);

  const setFood = (i, v) => {
    const copy = [...foods];
    copy[i] = v;
    setFoods(copy);
  };

  const submit = async () => {
    if (!symptoms.trim()) {
      alert("Please add symptoms");
      return;
    }

    setSubmitting(true);
    try {
      // Join all foods into a single comma-separated string
      const foodString = foods.filter((f) => f.trim() !== "").join(", ");

      console.log("Sending foodData as string:", foodString);

      await onSubmit({
        symptoms,
        travelHistory,
        occupation,
        foodData: foodString, // Single string instead of array
      });
    } catch (error) {
      console.error("Submit error:", error);
      alert(
        "Submission failed: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="slide-overlay">
      <div className="slide-panel">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">New Treatment</h3>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
        </div>

        <label className="block text-sm font-medium mb-1">Symptoms *</label>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className="w-full border p-2 rounded mb-3"
          rows={4}
          placeholder="Describe your symptoms..."
        />

        <label className="block text-sm font-medium mb-1">Travel History</label>
        <textarea
          value={travelHistory}
          onChange={(e) => setTravelHistory(e.target.value)}
          className="w-full border p-2 rounded mb-3"
          rows={2}
          placeholder="Recent travel locations..."
        />

        <label className="block text-sm font-medium mb-1">Occupation</label>
        <input
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          placeholder="Your occupation..."
        />

        <label className="block text-sm font-medium mb-2">
          Daily Food Intake
        </label>
        <div className="grid grid-cols-1 gap-3 mb-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i}>
              <label className="text-sm text-slate-600">Day {i + 1}</label>
              <input
                value={foods[i]}
                onChange={(e) => setFood(i, e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Foods consumed..."
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={submit}
            disabled={submitting}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
