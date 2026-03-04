import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

const navbarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 1.5rem",
  height: "56px",
  backgroundColor: "#1a1a1a",
  boxSizing: "border-box",
};

const logoLinkStyle = { display: "flex", alignItems: "center" };

const logoImgStyle = { height: "40px", width: "auto", display: "block" };

const rightStyle = { display: "flex", alignItems: "center", gap: "1rem" };

const logoutButtonStyle = {
  padding: "0.35rem 0.75rem",
  fontSize: "0.9rem",
  border: "1px solid rgba(255,255,255,0.5)",
  borderRadius: "6px",
  background: "transparent",
  cursor: "pointer",
  color: "#fff",
};

function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav style={navbarStyle}>
      <Link to="/" style={logoLinkStyle}>
        <img src="/SPS.png" alt="SPS Group" style={logoImgStyle} />
      </Link>
      <div style={rightStyle}>
        <LanguageSwitcher variant="light" />
        {isLoggedIn && (
          <button type="button" style={logoutButtonStyle} onClick={handleLogout}>
            {t("common.logout")}
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
