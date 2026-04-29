import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function VoterLogin() {
  const [form, setForm] = useState({ epicId: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/api/voters/login", form);
      const voter = res.data;

      if (voter.hasVoted) {
        setError("✅ You have already voted. Thank you for participating!");
      } else {
        localStorage.setItem("voter", JSON.stringify(voter));
        navigate("/vote", { state: { voter } });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid EPIC ID or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FF9933] via-[#FFFFFF] to-[#138808] p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">TN Election 2026</h1>
          <p className="text-gray-600 text-sm">Voter Login Portal</p>
        </div>

        {error && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${
            error.includes("✅") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              EPIC ID (Voter ID)
            </label>
            <input
              type="text"
              value={form.epicId}
              onChange={(e) => setForm({ ...form, epicId: e.target.value })}
              placeholder="e.g., NUO1234561"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#138808] outline-none transition-all uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#138808] outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">Provided by election officer during approval</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#138808] to-[#0d6646] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
          >
            {loading ? "Verifying..." : "Login to Vote"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:underline text-sm">← Back to Registration</a>
        </div>
      </div>
    </div>
  );
}

export default VoterLogin;