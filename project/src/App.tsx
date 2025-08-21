import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import ParentDashboard from './components/ParentDashboard';
import DeliveryDashboard from './components/DeliveryDashboard';
import SchoolDashboard from './components/SchoolDashboard';
import AdminDashboard from './components/AdminDashboard';
import CatererDashboard from './components/CatererDashboard';
import OnboardingTour from './components/OnboardingTour';

const DashboardContent: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  // Show onboarding for first-time users
  if (user.isFirstLogin) {
    return <OnboardingTour />;
  }

  const renderDashboard = () => {
    switch (user.userType) {
      case 'parent':
        return <ParentDashboard />;
      case 'delivery':
        return <DeliveryDashboard />;
      case 'school':
        return <SchoolDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'caterer':
        return <CatererDashboard />;
      default:
        return <div className="p-8 text-center">Unknown user type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {renderDashboard()}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}

export default App;