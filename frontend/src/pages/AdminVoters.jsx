import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminVoters() {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("isAdmin")) navigate("/admin");
    fetchVoters();
  }, []);

  const fetchVoters = async () => {
    try {
      const res = await API.get("/api/admin/voters/pending");
      setVoters(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    if (!window.confirm(`${status === "approved" ? "Approve" : "Reject"} this voter?`)) return;
    try {
      await API.patch(`/api/admin/voters/${id}/status`, { status });
      fetchVoters();
    } catch {
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF9933] border-t-[#138808]"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">👥 Manage Voters</h1>
          <button onClick={() => navigate("/admin/dashboard")} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">← Back to Dashboard</button>
        </div>

        {voters.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-16 text-center">
            <div className="text-7xl mb-4">📭</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No Pending Registrations</h3>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-100">
            <table className="w-full text-left">
              <thead className="bg-gray-50"><tr><th className="p-4">Name</th><th className="p-4">EPIC ID</th><th className="p-4">Constituency</th><th className="p-4 text-right">Actions</th></tr></thead>
              <tbody>
                {voters.map((v) => (
                  <tr key={v._id} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-medium">{v.name}</td>
                    <td className="p-4 text-sm font-mono">{v.epicId}</td>
                    <td className="p-4 text-sm">{v.constituency}</td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleAction(v._id, "approved")} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Approve</button>
                      <button onClick={() => handleAction(v._id, "rejected")} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminVoters;