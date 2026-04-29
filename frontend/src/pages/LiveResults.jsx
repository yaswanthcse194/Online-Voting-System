import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import { partySymbols } from "../data/partySymbols";

function LiveResults() {
  const { state } = useLocation();
  const constituency = state?.constituency || "Chennai Central";
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, [constituency]);

  const fetchResults = async () => {
    try {
      const res = await API.get(`/api/election/results/${encodeURIComponent(constituency)}`);
      setResults(res.data);
    } catch { console.error("Failed to fetch results"); } 
    finally { setLoading(false); }
  };

  if (loading && !results) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF9933] border-t-[#138808]"></div></div>;

  const maxVotes = Math.max(...(results?.candidates.map(c => c.votes) || [1]));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF9933] to-[#138808] rounded-lg flex items-center justify-center text-white font-bold">📊</div>
            <div>
              <h1 className="font-bold text-gray-800">Live Results</h1>
              <p className="text-xs text-gray-500">{constituency} Constituency</p>
            </div>
          </div>
          <button onClick={() => navigate("/")} className="text-sm text-gray-500 hover:text-gray-700">Home</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🗳️ Voter Turnout</h2>
          <div className="flex items-end gap-4">
            <div className="flex-1"><div className="h-4 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#FF9933] to-[#138808] transition-all duration-500" style={{ width: `${results?.turnout.percentage || 0}%` }}></div></div></div>
            <div className="text-right"><p className="text-3xl font-bold text-gray-800">{results?.turnout.percentage || 0}%</p><p className="text-sm text-gray-500">{results?.turnout.voted} of {results?.turnout.totalApproved} voted</p></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">📈 Candidate Standings</h2>
          <div className="space-y-5">
            {results?.candidates.map((c, idx) => {
              const width = maxVotes > 0 ? (c.votes / maxVotes) * 100 : 0;
              return (
                <div key={c._id}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400 w-6">#{idx + 1}</span>
                      <span className="text-2xl">{partySymbols[c.party]?.symbol || "🗳️"}</span>
                      <div>
                        <p className="font-medium text-gray-800">{c.name}</p>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          c.party === "NOTA" ? "bg-gray-200 text-gray-700" :
                          c.party === "DMK" ? "bg-blue-100 text-blue-700" :
                          c.party === "AIADMK" ? "bg-orange-100 text-orange-700" :
                          c.party === "BJP" ? "bg-yellow-100 text-yellow-700" :
                          c.party === "INC" ? "bg-green-100 text-green-700" :
                          c.party === "NTK" ? "bg-red-100 text-red-700" :
                          c.party === "TVK" ? "bg-purple-100 text-purple-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>{c.party}</span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-800">{c.votes} votes</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${
                      c.party === "DMK" ? "bg-blue-500" : c.party === "AIADMK" ? "bg-orange-500" : c.party === "NOTA" ? "bg-gray-400" : "bg-green-500"
                    }`} style={{ width: `${width}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">🔄 Results auto-refresh every 10 seconds</p>
      </main>
    </div>
  );
}

export default LiveResults;