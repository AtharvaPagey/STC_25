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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Fetch current user
        const userRes = await api.get("/users/current-user");
        console.log("User data:", userRes.data);

        // Try to fetch previous diseases/treatments
        try {
          const treatmentsRes = await api.get("/users/prev-diseases");
          setTreatments(treatmentsRes.data?.data || []);
        } catch (err) {
          console.log("No previous treatments endpoint or no data");
          setTreatments([]);
        }
      } catch (e) {
        console.error("Error loading dashboard:", e);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onNewSubmit = async (payload) => {
    try {
      const res = await api.post("/users/predict", payload);
      const output = res?.data?.data || res?.data;
      setResultData(output);
      setShowNew(false);

      // Optionally reload treatments after new prediction
      // const treatmentsRes = await api.get("/users/prev-diseases");
      // setTreatments(treatmentsRes.data?.data || []);
    } catch (e) {
      console.error("Prediction error:", e);
      alert(e.response?.data?.message || "Submission failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">STC Treatments</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNew(true)}
            className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
          >
            New Treatment
          </button>
          {user && user.email === "admin@yourdomain.com" && (
            <button
              onClick={() => setShowFinetune(true)}
              className="bg-yellow-500 px-3 py-2 rounded hover:bg-yellow-600"
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
