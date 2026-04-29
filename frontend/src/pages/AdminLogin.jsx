import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/api/admin/login", creds);
      if (res.data.success) {
        localStorage.setItem("isAdmin", "true");
        navigate("/admin/dashboard");
      }
    } catch {
      setError("Invalid admin credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FF9933] via-[#FFFFFF] to-[#138808] p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🔐 Admin Portal</h2>
            <p className="text-gray-500 text-sm mt-1">TN Election Commission</p>
          </div>
          <a href="/" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition">
            ← Back to Home
          </a>
        </div>

        {error && <p className="text-red-500 text-center bg-red-50 p-3 rounded-lg mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <input type="text" value={creds.username} onChange={(e) => setCreds({...creds, username: e.target.value})} required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#138808] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input type="password" value={creds.password} onChange={(e) => setCreds({...creds, password: e.target.value})} required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#138808] outline-none" />
          </div>
          <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-[#FF9933] to-[#138808] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
            Login to Dashboard
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">Authorized personnel only. All actions are logged.</p>
      </div>
    </div>
  );
}

export default AdminLogin;