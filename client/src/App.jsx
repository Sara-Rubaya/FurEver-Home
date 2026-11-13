
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import SosButton from "./components/SosButton.jsx";

import Hero from "./components/Hero.jsx";
import WhyChooseUs from "./components/WhyChooseUs.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import FAQ from "./components/FAQ.jsx";
import CTA from "./components/CTA.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ReportAnimal from "./pages/ReportAnimal.jsx";
import ReportsDashboard from "./pages/ReportsDashboard.jsx";
import MyReports from "./pages/MyReports.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Animals from "./pages/Animals.jsx";
import AnimalDetails from "./pages/AnimalDetails.jsx";
import ApplyAdoption from "./pages/ApplyAdoption.jsx";
import MyApplications from "./pages/MyApplications.jsx";
import ShelterAnimals from "./pages/ShelterAnimals.jsx";
import ShelterApplications from "./pages/ShelterApplications.jsx";
import ShelterDashboard from "./pages/ShelterDashboard.jsx";
import ShelterProfile from "./pages/ShelterProfile.jsx";

import ReportMap from "./pages/ReportMap.jsx";
import VetsNearMe from "./pages/VetsNearMe.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import VetDirectory from "./pages/VetDirectory.jsx";
import VetDetails from "./pages/VetDetails.jsx";


// Home Page
function Home() {
  return (
    <>
      <Hero />
      <WhyChooseUs />
      <HowItWorks />
      <FAQ />
      <CTA />
    </>
  );
}

// Role-based Dashboard
function Dashboard() {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <AdminDashboard />;
  }

  if (user?.role === "shelter") {
    return <ShelterDashboard />;
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-dark">
        Welcome, {user?.name} ({user?.role})
      </h1>

      <p className="mt-2 text-gray-600">
        This protected dashboard - only shelter/admin can access.
      </p>
    </section>
  );
}

// Unauthorized Page
function Unauthorized() {
  return (
    <section className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-red-600">
        403 - Access Denied
      </h1>

      <p className="mt-2 text-gray-600">
        You do not have permission to access this page.
      </p>
    </section>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/vet-directory" element={<VetDirectory />} />
          <Route path="/vet-directory/:id" element={<VetDetails />} />

          <Route path="/" element={<Home />} />
          <Route path="/vets" element={<VetsNearMe />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/animals" element={<Animals />} />
          <Route path="/animals/:id" element={<AnimalDetails />} />

          {/* Dashboard - Shelter & Admin */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["shelter", "admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Shelter Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["shelter"]}>
                <ShelterProfile />
              </ProtectedRoute>
            }
          />

          {/* Report Animal */}
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <ReportAnimal />
              </ProtectedRoute>
            }
          />

          {/* Reports Dashboard */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={["shelter", "admin"]}>
                <ReportsDashboard />
              </ProtectedRoute>
            }
          />

          {/* My Reports */}
          <Route
            path="/my-reports"
            element={
              <ProtectedRoute>
                <MyReports />
              </ProtectedRoute>
            }
          />

          {/* Apply for Adoption */}
          <Route
            path="/animals/:id/apply"
            element={
              <ProtectedRoute allowedRoles={["adopter"]}>
                <ApplyAdoption />
              </ProtectedRoute>
            }
          />

          {/* My Applications */}
          <Route
            path="/my-applications"
            element={
              <ProtectedRoute allowedRoles={["adopter"]}>
                <MyApplications />
              </ProtectedRoute>
            }
          />

          {/* Shelter Animals */}
          <Route
            path="/my-animals"
            element={
              <ProtectedRoute allowedRoles={["shelter"]}>
                <ShelterAnimals />
              </ProtectedRoute>
            }
          />

          {/* Shelter Applications */}
          <Route
            path="/shelter-applications"
            element={
              <ProtectedRoute allowedRoles={["shelter", "admin"]}>
                <ShelterApplications />
              </ProtectedRoute>
            }
          />

          {/* Report Map - Shelter & Admin */}
          <Route
            path="/report-map"
            element={
              <ProtectedRoute allowedRoles={["shelter", "admin"]}>
                <ReportMap />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />

      {/* Emergency SOS Button */}
      <SosButton />
    </div>
  );
}
