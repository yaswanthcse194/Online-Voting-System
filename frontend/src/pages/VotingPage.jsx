import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import { partySymbols } from "../data/partySymbols";

function VotingPage() {
  const { state } = useLocation();
  const voter = state?.voter || JSON.parse(localStorage.getItem("voter"));
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!voter) { navigate("/voter-login"); return; }
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await API.get(`/api/election/candidates/${encodeURIComponent(voter.constituency)}`);
      setCandidates(res.data);
    } catch { console.error("Failed to load candidates"); } 
    finally { setLoading(false); }
  };

  const castVote = async () => {
    if (!selected) return;
    setVoting(true);
    try {
      await API.post("/api/election/vote", {
        voterId: voter._id,
        candidateId: selected,
        constituency: voter.constituency
      });
      alert("✅ Vote recorded successfully! Thank you for voting.");
      navigate("/results", { state: { constituency: voter.constituency } });
    } catch (err) {
      alert(err.response?.data?.message || "Voting failed. Please try again.");
    } finally { setVoting(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF9933] border-t-[#138808]"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF9933] to-[#138808] rounded-lg flex items-center justify-center text-white font-bold">🗳️</div>
            <div>
              <h1 className="font-bold text-gray-800">Cast Your Vote</h1>
              <p className="text-xs text-gray-500">{voter.constituency} Constituency</p>
            </div>
          </div>
          <button onClick={() => navigate("/")} className="text-sm text-gray-500 hover:text-gray-700">Exit</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-600 mb-6">Select your preferred candidate:</p>
        
        <div className="space-y-4">
          {candidates.map((c) => (
            <label 
              key={c._id}
              className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${selected === c._id ? "border-[#138808] bg-green-50 shadow-md" : "border-gray-200 hover:border-gray-300 bg-white"}`}
            >
              <input type="radio" name="candidate" value={c._id} checked={selected === c._id} onChange={() => setSelected(c._id)} className="w-5 h-5 text-[#138808] focus:ring-[#138808]" />
              
              {/* EXACT PARTY SYMBOL */}
              <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-4xl shadow-sm">
                {partySymbols[c.party]?.symbol || "🗳️"}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-lg text-gray-800">{c.name}</p>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                  c.party === "NOTA" ? "bg-gray-200 text-gray-700" :
                  c.party === "DMK" ? "bg-blue-100 text-blue-700" :
                  c.party === "AIADMK" ? "bg-orange-100 text-orange-700" :
                  c.party === "BJP" ? "bg-yellow-100 text-yellow-700" :
                  c.party === "INC" ? "bg-green-100 text-green-700" :
                  c.party === "NTK" ? "bg-red-100 text-red-700" :
                  c.party === "TVK" ? "bg-purple-100 text-purple-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {c.party} • {partySymbols[c.party]?.name || ""}
                </span>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={castVote} disabled={!selected || voting} className="px-8 py-3 bg-gradient-to-r from-[#138808] to-[#0d6646] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {voting ? "Casting Vote..." : "Confirm & Cast Vote"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default VotingPage;