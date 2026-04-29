import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF9933] to-[#138808] rounded-lg flex items-center justify-center text-white font-bold shadow-md">
              🗳️
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Election Admin Panel</h1>
              <p className="text-xs text-gray-500">TN Election 2026</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-all border border-red-200"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-12">Select Management Section</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Manage Voters Card */}
          <button
            onClick={() => navigate("/admin/dashboard/voters")}
            className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all text-left group"
          >
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              👥
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Manage Voters</h3>
            <p className="text-gray-600 text-sm">Approve or reject voter registrations and set passwords</p>
            <div className="mt-4 text-blue-600 font-medium text-sm group-hover:translate-x-2 transition-transform">
              → Access Voter Management
            </div>
          </button>

          {/* Manage Candidates Card */}
          <button
            onClick={() => navigate("/admin/candidates")}
            className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-100 hover:border-green-500 hover:shadow-xl transition-all text-left group"
          >
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              📋
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Manage Candidates</h3>
            <p className="text-gray-600 text-sm">Add or remove candidates for all constituencies</p>
            <div className="mt-4 text-green-600 font-medium text-sm group-hover:translate-x-2 transition-transform">
              → Access Candidate Management
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;