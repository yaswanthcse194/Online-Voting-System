import { useEffect, useState } from "react";
import API from "../services/api";
import { tnConstituencies } from "../data/constituencies";
import { partySymbols, parties } from "../data/partySymbols";

function ElectionDashboard() {
  const [summary, setSummary] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [filters, setFilters] = useState({ party: "All", constituency: "All", query: "" });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview | search | constituency

  useEffect(() => {
    fetchSummary();
    // Auto-refresh every 15 seconds for live updates
    const interval = setInterval(fetchSummary, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await API.get("/api/election/summary");
      setSummary(res.data);
    } catch {
      console.error("Failed to fetch summary");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.party !== "All") params.append("party", filters.party);
      if (filters.constituency !== "All") params.append("constituency", filters.constituency);
      if (filters.query) params.append("query", filters.query);
      
      const res = await API.get(`/api/election/search?${params}`);
      setSearchResults(res.data);
    } catch {
      console.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF9933] border-t-[#138808]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF9933] to-[#138808] rounded-lg flex items-center justify-center text-white font-bold">📊</div>
            <div>
              <h1 className="font-bold text-gray-800">TN Election 2026 • Live Dashboard</h1>
              <p className="text-xs text-gray-500">Real-time results & analytics</p>
            </div>
          </div>
          <button onClick={() => window.location.href = "/"} className="text-sm text-gray-500 hover:text-gray-700">← Home</button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-2 border-b">
          {["overview", "search", "constituency"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition ${
                activeTab === tab 
                  ? "text-[#138808] border-b-2 border-[#138808]" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === "overview" && summary && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard title="Total Voters" value={summary.summary.totalVoters.toLocaleString()} color="blue" />
              <StatCard title="Votes Polled" value={summary.summary.totalPolled.toLocaleString()} color="green" />
              <StatCard title="Turnout" value={`${summary.summary.turnout}%`} color="orange" />
              <StatCard title="Remaining" value={summary.summary.remaining.toLocaleString()} color="purple" />
            </div>

            {/* Leading Party Banner */}
            <div className="bg-gradient-to-r from-[#FF9933] to-[#138808] rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">🏆 Currently Leading</p>
                  <p className="text-3xl font-bold">{summary.leading.party}</p>
                  <p className="text-sm opacity-90">{summary.leading.votes} votes</p>
                </div>
                <div className="text-6xl">{partySymbols[summary.leading.party]?.symbol || "🗳️"}</div>
              </div>
            </div>

            {/* Party-wise Results */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-4">📈 Party-wise Vote Share</h3>
              <div className="space-y-4">
                {summary.partyStats.map((p, i) => (
                  <div key={p.party}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium flex items-center gap-2">
                        <span className="text-lg">{partySymbols[p.party]?.symbol}</span>
                        {p.party}
                      </span>
                      <span>{p.votes} votes ({p.percentage}%)</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${getPartyColor(p.party)}`}
                        style={{ width: `${p.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === "search" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-4">🔍 Search Candidates</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select 
                  value={filters.party}
                  onChange={(e) => setFilters({...filters, party: e.target.value})}
                  className="px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#138808] outline-none bg-white"
                >
                  <option value="All">All Parties</option>
                  {parties.map(p => (
                    <option key={p} value={p}>{partySymbols[p].symbol} {p}</option>
                  ))}
                </select>
                
                <select 
                  value={filters.constituency}
                  onChange={(e) => setFilters({...filters, constituency: e.target.value})}
                  className="px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#138808] outline-none bg-white"
                >
                  <option value="All">All Constituencies</option>
                  {tnConstituencies.slice(0, 50).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Search by name..."
                    value={filters.query}
                    onChange={(e) => setFilters({...filters, query: e.target.value})}
                    className="flex-1 px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#138808] outline-none"
                  />
                  <button 
                    onClick={handleSearch}
                    className="px-6 py-2.5 bg-[#138808] text-white rounded-xl hover:bg-[#0d6646] transition"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              {searchResults.length === 0 ? (
                <p className="p-8 text-center text-gray-500">Enter search criteria to find candidates</p>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4">Symbol</th>
                      <th className="p-4">Candidate</th>
                      <th className="p-4">Party</th>
                      <th className="p-4">Constituency</th>
                      <th className="p-4 text-right">Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map(c => (
                      <tr key={c._id} className="border-t hover:bg-gray-50">
                        <td className="p-4 text-2xl">{c.symbol}</td>
                        <td className="p-4 font-medium">{c.name}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPartyBadge(c.party)}`}>
                            {c.party}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{c.constituency}</td>
                        <td className="p-4 text-right font-bold text-gray-800">{c.votes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Constituency Tab */}
        {activeTab === "constituency" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-4">📍 Select Constituency</h3>
              <select 
                onChange={async (e) => {
                  if (e.target.value === "All") return;
                  setLoading(true);
                  try {
                    const res = await API.get(`/api/election/constituency/${encodeURIComponent(e.target.value)}`);
                    // Handle constituency data (you can expand this)
                    alert(`Showing stats for ${e.target.value}`);
                  } catch {
                    alert("Failed to load constituency data");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#138808] outline-none bg-white"
              >
                <option value="All">-- Select Constituency --</option>
                {tnConstituencies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper Components & Functions
function StatCard({ title, value, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50", 
    orange: "text-orange-600 bg-orange-50",
    purple: "text-purple-600 bg-purple-50"
  };
  return (
    <div className={`p-5 rounded-xl ${colors[color]} shadow-sm`}>
      <p className="text-sm font-medium opacity-70">{title}</p>
      <p className={`text-2xl font-bold ${colors[color].split(" ")[0]}`}>{value}</p>
    </div>
  );
}

function getPartyColor(party) {
  const map = {
    "DMK": "bg-blue-500", "AIADMK": "bg-orange-500", "BJP": "bg-yellow-500",
    "INC": "bg-green-500", "TVK": "bg-purple-500", "NTK": "bg-red-500",
    "NOTA": "bg-gray-400", "Others": "bg-gray-500"
  };
  return map[party] || "bg-gray-500";
}

function getPartyBadge(party) {
  const map = {
    "DMK": "bg-blue-100 text-blue-700", "AIADMK": "bg-orange-100 text-orange-700",
    "BJP": "bg-yellow-100 text-yellow-700", "INC": "bg-green-100 text-green-700",
    "TVK": "bg-purple-100 text-purple-700", "NTK": "bg-red-100 text-red-700",
    "NOTA": "bg-gray-200 text-gray-700"
  };
  return map[party] || "bg-gray-100 text-gray-700";
}

export default ElectionDashboard;