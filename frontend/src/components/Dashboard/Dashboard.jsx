// src/components/Dashboard/Dashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import TreatmentList from "./TreatmentList";
import NewTreatmentSlide from "./NewTreatmentSlide";
import ResultPopup from "./ResultPopup";
import ProfileDropdown from "./ProfileDropdown";
import AdminFinetuneModal from "../Admin/AdminFinetuneModal";

export default function Dashboard({ user }) {
  const [treatments, setTreatments] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [showFinetune, setShowFinetune] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // try to get user's previous disease details (your backend util expects getDetailedPreviousDiseasesForUser)
        const res = await api.get("/users/current-user");
        // Optionally fetch prevDiseases using a backend endpoint; here we just fetch user and then use available prevDisease
        // For list of saved treatments, backend may provide /treatments/my - adapt if route differs
        // We'll try /users/prev-diseases (if exists) else fallback to empty
        // For now fetch treatments via custom endpoint if exists:
        try {
          const t = await api.get("/treatments/my");
          setTreatments(t.data?.data || []);
        } catch (err) {
          // no treatments endpoint; leave blank
          setTreatments([]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const onNewSubmit = async (payload) => {
    try {
      // backend expects POST /users/predict (verifyJWT middleware) - we must include access token (axiosInstance includes it)
      const res = await api.post("/users/predict", payload);
      // backend returns ApiResponse structure; actual data may be in res.data.data
      const output = res?.data?.data || res?.data;
      setResultData(output);
      // you can also update the list by pushing a new entry (if backend returns 'treatment')
    } catch (e) {
      console.error(e);
      alert("Submission failed");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">STC Treatments</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNew(true)}
            className="bg-green-600 text-white px-3 py-2 rounded"
          >
            New Treatment
          </button>
          {user && user.email === "admin@yourdomain.com" && (
            <button
              onClick={() => setShowFinetune(true)}
              className="bg-yellow-500 px-3 py-2 rounded"
            >
              Finetune
            </button>
          )}
          <ProfileDropdown user={user} />
        </div>
      </header>

      <main>
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Previous Treatments</h2>
          <TreatmentList items={treatments} />
        </section>
      </main>

      {showNew && (
        <NewTreatmentSlide
          onClose={() => setShowNew(false)}
          onSubmit={onNewSubmit}
        />
      )}
      {resultData && (
        <ResultPopup data={resultData} onClose={() => setResultData(null)} />
      )}
      {showFinetune && (
        <AdminFinetuneModal onClose={() => setShowFinetune(false)} />
      )}
    </div>
  );
}
