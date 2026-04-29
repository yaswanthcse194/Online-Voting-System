import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VoterRegister from "./pages/VoterRegister";
import VoterLogin from "./pages/VoterLogin";
import VotingPage from "./pages/VotingPage";
import LiveResults from "./pages/LiveResults";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminVoters from "./pages/AdminVoters";
import AdminCandidates from "./pages/AdminCandidates";
import ElectionDashboard from "./pages/ElectionDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VoterRegister />} />
        <Route path="/voter-login" element={<VoterLogin />} />
        <Route path="/vote" element={<VotingPage />} />
        <Route path="/results" element={<LiveResults />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/dashboard/voters" element={<AdminVoters />} />
        <Route path="/admin/candidates" element={<AdminCandidates />} />
        <Route path="/dashboard" element={<ElectionDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;