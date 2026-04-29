import { useState } from "react";
import { tnConstituencies } from "../data/constituencies";
import API from "../services/api";

function VoterRegister() {
  const [form, setForm] = useState({
    epicId: "", aadhaar: "", name: "", mobile: "", constituency: "", password: ""
  });
  const [confirmPass, setConfirmPass] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Password validation rules
  const passRules = [
    { test: form.password.length >= 8, label: "At least 8 characters" },
    { test: /[A-Z]/.test(form.password), label: "One uppercase letter" },
    { test: /\d/.test(form.password), label: "One number" },
    { test: /[@$!%*?&]/.test(form.password), label: "One special character (@$!%*?&)" }
  ];
  const isPassValid = passRules.every(r => r.test);
  const doPasswordsMatch = form.password === confirmPass && form.password !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!isPassValid) return setMessage({ type: "error", text: "Password does not meet security requirements" });
    if (!doPasswordsMatch) return setMessage({ type: "error", text: "Passwords do not match" });

    setLoading(true);
    try {
      const res = await API.post("/api/voters/register", form);
      setMessage({ type: "success", text: res.data.message });
      setForm({ epicId: "", aadhaar: "", name: "", mobile: "", constituency: "", password: "" });
      setConfirmPass("");
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FF9933] via-[#FFFFFF] to-[#138808] p-4">
      <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">TN Election 2026</h1>
          <p className="text-gray-600 text-sm">Voter Registration Portal</p>
        </div>

        {message.text && (
          <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-3">
          <input name="epicId" value={form.epicId} onChange={handleChange} placeholder="EPIC ID (e.g., NUO1234561)" pattern="[A-Za-z]{3}\d{7}" required className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#138808] outline-none uppercase" />
          <input name="aadhaar" value={form.aadhaar} onChange={handleChange} placeholder="Aadhaar Number (12 digits)" pattern="\d{12}" maxLength="12" required className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#138808] outline-none" />
          <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#138808] outline-none" />
          <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="Mobile Number" pattern="[6-9]\d{9}" maxLength="10" required className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#138808] outline-none" />
          <select name="constituency" value={form.constituency} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#138808] outline-none bg-white">
            <option value="">-- Select Constituency --</option>
            {tnConstituencies.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
          
          <div className="pt-3 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-700 mb-2">🔒 Set Your Voting Password</p>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Create Password" required className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#138808] outline-none mb-3" />
            <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Confirm Password" required className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#138808] outline-none mb-3" />
            
            <ul className="space-y-1 mt-2">
              {passRules.map((rule, i) => (
                <li key={i} className={`text-xs flex items-center gap-2 ${rule.test ? "text-green-600" : "text-gray-500"}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${rule.test ? "bg-green-100" : "bg-gray-100"}`}>
                    {rule.test ? "✓" : "○"}
                  </span>
                  {rule.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button type="submit" disabled={loading || !isPassValid || !doPasswordsMatch} className="w-full mt-5 py-3 bg-gradient-to-r from-[#138808] to-[#0d6646] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? "Submitting..." : "Submit for Verification"}
        </button>
                <a href="/dashboard" className="block mt-4 text-center px-4 py-2 bg-[#138808] text-white rounded-xl hover:bg-[#0d6646] transition font-medium">📊 Live Election Dashboard</a>

        <div className="mt-5 pt-4 border-t border-gray-200 grid grid-cols-2 gap-3">
          <a href="/voter-login" className="text-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-all">Voter Login</a>
          <a href="/admin" className="text-center py-2.5 px-4 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-medium text-sm transition-all">Admin Login</a>
        </div>
      </form>
    </div>
  );
}

export default VoterRegister;