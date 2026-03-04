import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import useMediaQuery from "../hooks/useMediaQuery";
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

const leftStyle = { display: "flex", alignItems: "center", gap: "1rem" };

const logoLinkStyle = { display: "flex", alignItems: "center" };

const logoImgStyle = { height: "40px", width: "auto", display: "block" };

const homeLinkStyle = { display: "flex", alignItems: "center", color: "#fff", textDecoration: "none" };

const rightStyle = { display: "flex", alignItems: "center", gap: "1rem" };

const logoutButtonStyle = {
  padding: "0.35rem 0.75rem",
  fontSize: "0.9rem",
  border: "1px solid rgba(255,255,255,0.5)",
  borderRadius: "6px",
  background: "transparent",
  cursor: "pointer",
  color: "#fff",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
};

const homeIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const logoutIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const hamburgerIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 998,
  background: "transparent",
};

const menuPanelStyle = {
  position: "absolute",
  top: "56px",
  right: 0,
  minWidth: "200px",
  padding: "1rem",
  backgroundColor: "#1a1a1a",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  zIndex: 999,
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  boxSizing: "border-box",
};

const menuPanelStyleMobile = {
  ...menuPanelStyle,
  top: "auto",
  bottom: "56px",
  boxShadow: "0 -4px 12px rgba(0,0,0,0.3)",
};

const hamburgerButtonStyle = {
  padding: "0.35rem",
  border: "none",
  background: "transparent",
  color: "#fff",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

function Navbar() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const { t } = useLanguage();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const rightContent = (
    <>
      {isLoggedIn && user?.name && (
        <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.95rem" }}>
          {t("common.helloUser", { name: user.name })}
        </span>
      )}
      <LanguageSwitcher variant="light" />
      {isLoggedIn && (
        <button type="button" style={logoutButtonStyle} onClick={handleLogout} title={t("common.logout")}>
          {logoutIcon}
          {t("common.logout")}
        </button>
      )}
    </>
  );

  const navStyle = isMobile
    ? { ...navbarStyle, position: "fixed", bottom: 0, left: 0, right: 0, top: "auto", zIndex: 1000 }
    : { ...navbarStyle, position: "relative" };

  return (
    <>
      <nav style={navStyle}>
        <div style={leftStyle}>
          {!isMobile && (
            <Link to="/" style={logoLinkStyle}>
              <img src="/SPS.png" alt="SPS Group" style={logoImgStyle} />
            </Link>
          )}
          <Link
            to="/"
            style={homeLinkStyle}
            title={t("common.home")}
            aria-label={t("common.home")}
          >
            {homeIcon}
          </Link>
        </div>
        {isMobile ? (
          <>
            <button
              type="button"
              style={hamburgerButtonStyle}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              title="Menu"
            >
              {hamburgerIcon}
            </button>
            {menuOpen && (
              <>
                <div
                  style={overlayStyle}
                  onClick={() => setMenuOpen(false)}
                  aria-hidden
                />
                <div style={menuPanelStyleMobile}>
                  {rightContent}
                </div>
              </>
            )}
          </>
        ) : (
          <div style={rightStyle}>
            {rightContent}
          </div>
        )}
      </nav>
    </>
  );
}

export default Navbar;
