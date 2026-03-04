import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useMediaQuery from "../hooks/useMediaQuery";
import Navbar from "./Navbar";

const mainStyle = { padding: "1rem 1.5rem", boxSizing: "border-box" };

const wrapperStyleMobile = {
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
};

export default function ProtectedRoute() {
  const { isLoggedIn } = useAuth();
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const style = isMobile
    ? {
        ...mainStyle,
        paddingBottom: "calc(1rem + 56px + 100px)",
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
      }
    : mainStyle;

  const content = (
    <>
      <main style={style}>
        <Outlet />
      </main>
      <Navbar />
    </>
  );

  return isMobile ? (
    <div style={wrapperStyleMobile}>{content}</div>
  ) : (
    <>
      <Navbar />
      <main style={mainStyle}>
        <Outlet />
      </main>
    </>
  );
}
