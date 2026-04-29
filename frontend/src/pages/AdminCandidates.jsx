import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { tnConstituencies } from "../data/constituencies";
import { partySymbols, parties } from "../data/partySymbols";

function AdminCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [form, setForm] = useState({ 
    name: "", 
    party: "", 
    constituency: "", 
    symbol: "" 
  });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("isAdmin")) navigate("/admin");
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    const res = await API.get("/api/admin/candidates");
    setCandidates(res.data);
  };

  const handlePartyChange = (party) => {
    const symbol = partySymbols[party]?.symbol || "";
    setForm({ ...form, party, symbol });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await API.post("/api/admin/candidates", form);
      setMsg("✅ Candidate added successfully!");
      setForm({ name: "", party: "", constituency: "", symbol: "" });
      fetchCandidates();
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("❌ Failed to add candidate");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this candidate?")) return;
    try {
      await API.delete(`/api/admin/candidates/${id}`);
      setMsg("🗑️ Candidate deleted");
      fetchCandidates();
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("❌ Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">📋 Manage Candidates</h1>
            <p className="text-gray-600 text-sm mt-1">Add or remove candidates for all constituencies</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/admin/dashboard")} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
              ← Back to Dashboard
            </button>
            <button onClick={() => navigate("/admin/dashboard/voters")} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Manage Voters →
            </button>
          </div>
        </div>

        {msg && (
          <div className={`mb-4 p-4 rounded-xl text-sm font-medium ${
            msg.includes("✅") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}>
            {msg}
          </div>
        )}

        {/* Add Form */}
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow mb-8 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">➕ Add New Candidate</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input 
              type="text" 
              placeholder="Candidate Name" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
              required 
            />
            
            <select 
              value={form.party} 
              onChange={e => handlePartyChange(e.target.value)} 
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              required
            >
              <option value="">Select Party</option>
              {parties.map(party => (
                <option key={party} value={party}>
                  {partySymbols[party].symbol} {party} ({partySymbols[party].name})
                </option>
              ))}
            </select>
            
            <select 
              value={form.constituency} 
              onChange={e => setForm({...form, constituency: e.target.value})} 
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              required
            >
              <option value="">Select Constituency</option>
              {tnConstituencies.map((con, idx) => (
                <option key={idx} value={con}>{con}</option>
              ))}
            </select>
            
            <div className="px-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 flex items-center gap-2">
              <span className="text-2xl">{form.symbol || "🗳️"}</span>
              <span className="text-sm text-gray-600">Symbol</span>
            </div>
            
            <button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition shadow-md"
            >
              Add Candidate
            </button>
          </div>
        </form>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4">Symbol</th>
                <th className="p-4">Name</th>
                <th className="p-4">Party</th>
                <th className="p-4">Constituency</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map(c => (
                <tr key={c._id} className="border-t hover:bg-gray-50">
                  <td className="p-4 text-2xl">{c.symbol}</td>
                  <td className="p-4 font-medium">{c.name}</td>
                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      c.party === "DMK" ? "bg-blue-100 text-blue-700" :
                      c.party === "AIADMK" ? "bg-orange-100 text-orange-700" :
                      c.party === "BJP" ? "bg-saffron-100 text-saffron-700" :
                      c.party === "NOTA" ? "bg-gray-200 text-gray-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {c.party}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{c.constituency}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(c._id)} 
                      className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminCandidates;