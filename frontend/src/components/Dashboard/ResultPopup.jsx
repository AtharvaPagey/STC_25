// src/components/Dashboard/ResultPopup.jsx
import React from "react";

export default function ResultPopup({ data, onClose }) {
  if (!data) return null;
  const { name, medicines, yogasanas } = data; // data from getTreatmentsForDisease output (dbimportexport)
  return (
    <div className="result-overlay" onClick={onClose}>
      <div className="result-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Prediction: {name || data?.prediction?.diseaseName}
          </h2>
          <button onClick={onClose} className="text-slate-600">
            Close
          </button>
        </div>

        <section className="mt-4">
          <h3 className="font-semibold">Yogasanas</h3>
          {(yogasanas || []).length === 0 ? (
            <p className="text-sm">None</p>
          ) : (
            (yogasanas || []).map((y, i) => (
              <div key={i} className="p-3 border rounded my-2">
                <div className="font-semibold">{y.name}</div>
                <div className="text-sm">
                  {y["muscles targeted"] || y.musclestargeted}
                </div>
                <a
                  className="text-indigo-600 text-sm"
                  href={y["youtube link"] || y.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  YouTube
                </a>
              </div>
            ))
          )}
        </section>

        <section className="mt-4">
          <h3 className="font-semibold">Medicines</h3>
          {(medicines || []).length === 0 ? (
            <p className="text-sm">None</p>
          ) : (
            (medicines || []).map((m, i) => (
              <div key={i} className="p-3 border rounded my-2">
                <div className="font-semibold">{m.name}</div>
                <div className="text-sm">
                  {m.effects ? m.effects.join(", ") : m.dose || ""}
                </div>
                <div className="text-sm text-slate-600">
                  {m.ingredients ? m.ingredients.join(", ") : ""}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
