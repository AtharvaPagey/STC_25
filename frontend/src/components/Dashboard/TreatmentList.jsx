// src/components/Dashboard/TreatmentList.jsx
import React from "react";

export default function TreatmentList({ items = [] }) {
  if (!items.length) {
    return (
      <div className="p-4 text-sm text-slate-600">
        No previous treatments yet.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((t) => (
        <div key={t._id || t.id} className="p-4 bg-white rounded shadow">
          <div className="flex justify-between">
            <div>
              <div className="font-semibold">
                {t.prediction?.diseaseName || "Treatment"}
              </div>
              <div className="text-sm text-slate-500">
                {new Date(t.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="mt-2 text-sm text-slate-700">
            <div>
              <strong>Symptoms:</strong> {t.symptoms || "—"}
            </div>
            <div>
              <strong>Travel:</strong> {t.travelHistory || "—"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
