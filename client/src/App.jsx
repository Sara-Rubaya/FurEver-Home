import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Hero from "./components/Hero.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import ReportAnimal from "./pages/ReportAnimal.jsx";
import ReportsDashboard from "./pages/ReportsDashboard.jsx";
import MyReports from "./pages/MyReports.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import WhyChooseUs from "./components/WhyChooseUs.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import FAQ from "./components/FAQ.jsx";
import CTA from "./components/CTA.jsx";
import Animals from "./pages/Animals.jsx";
import AnimalDetails from "./pages/AnimalDetails.jsx";
import ApplyAdoption from "./pages/ApplyAdoption.jsx";
import MyApplications from "./pages/MyApplications.jsx";
import ShelterAnimals from "./pages/ShelterAnimals.jsx";
import ShelterApplications from "./pages/ShelterApplications.jsx";
import ShelterDashboard from "./pages/ShelterDashboard.jsx";
import VetsNearMe from "./pages/VetsNearMe.jsx";

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
function Unauthorized() {
  return (
    <section className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-red-600">403 - Access Denied</h1>
      <p className="mt-2 text-gray-600">Protected </p>
    </section>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />


      <main className="flex-grow">
        <Routes>
          <Route path="/vets" element={<VetsNearMe />} />
          <Route 
          path="/" 
          element={<Home />} />

          <Route
           path="/login" 
           element={<Login />} />

          <Route 
          path="/register" 
          element={<Register />} />

          <Route
           path="/unauthorized" 
           element={<Unauthorized />} />


          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["shelter", "admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <ReportAnimal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={["shelter", "admin"]}>
                <ReportsDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
              path="/my-reports"
              element={
                <ProtectedRoute>
                  <MyReports />
                </ProtectedRoute>
              }
          />
          
<Route path="/animals" element={<Animals />} />

<Route path="/animals/:id" element={<AnimalDetails />} />

<Route
  path="/animals/:id/apply"
  element={
    <ProtectedRoute allowedRoles={["adopter"]}>
      <ApplyAdoption />
    </ProtectedRoute>
  }
/>

<Route
  path="/my-applications"
  element={
    <ProtectedRoute allowedRoles={["adopter"]}>
      <MyApplications />
    </ProtectedRoute>
  }
/>

<Route
  path="/my-animals"
  element={
    <ProtectedRoute allowedRoles={["shelter"]}>
      <ShelterAnimals />
    </ProtectedRoute>
  }
/>

<Route
  path="/shelter-applications"
  element={
    <ProtectedRoute allowedRoles={["shelter", "admin"]}>
      <ShelterApplications />
    </ProtectedRoute>
  }
/>


        </Routes>
      </main>
      <Footer />
    </div>
  );
}
