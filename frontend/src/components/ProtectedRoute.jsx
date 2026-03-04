import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "./Navbar";

const mainStyle = { padding: "1rem 1.5rem", boxSizing: "border-box" };

export default function ProtectedRoute() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      <main style={mainStyle}>
        <Outlet />
      </main>
    </>
  );
}
