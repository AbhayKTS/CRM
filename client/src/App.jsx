import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import LeadDetailsPage from "./pages/LeadDetailsPage";

function AppRoutes() {
  const { token } = useAuth();
  const [selectedLead, setSelectedLead] = useState(null);

  if (!token) {
    return <LoginPage />;
  }

  if (selectedLead) {
    return (
      <LeadDetailsPage
        leadId={selectedLead}
        onBack={() => setSelectedLead(null)}
      />
    );
  }

  return <DashboardPage onSelectLead={setSelectedLead} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
