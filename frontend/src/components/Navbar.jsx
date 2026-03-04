/**
 * Navbar principal: logo, Home, idioma, logout.
 * Desktop: barra no topo com todos os itens. Mobile: barra fixa no rodapé, botão de idioma
 * centralizado, menu hambúrguer (Olá + Sair) e painéis de idioma/menu que abrem acima da barra.
 */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import useMediaQuery from "../hooks/useMediaQuery";
import LanguageSwitcher from "./LanguageSwitcher";
import { getApiDocsUrl } from "../services/api";

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

/* Layout mobile: três zonas (Home à esquerda, idioma no centro, hambúrguer à direita) */
const mobileLeftStyle = { ...leftStyle, flex: 1, minWidth: 0, justifyContent: "flex-start" };
const mobileCenterStyle = { position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center" };
const mobileRightStyle = { display: "flex", alignItems: "center", gap: "0.25rem", flex: 1, minWidth: 0, justifyContent: "flex-end" };

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

const languageIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const docsIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
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
  left: 0,
  right: 0,
  minWidth: "auto",
  padding: "1.75rem 1.5rem",
  gap: "1.5rem",
  boxShadow: "0 -4px 12px rgba(0,0,0,0.3)",
};

/* Itens do menu mobile: área de toque maior */
const menuPanelItemMobileStyle = { padding: "0.5rem 0", fontSize: "1rem" };
const menuPanelButtonMobileStyle = { ...logoutButtonStyle, padding: "0.6rem 1rem", fontSize: "1rem" };

/* Painel de idiomas no mobile: largura total e bandeiras centralizadas/maiores */
const languagePanelStyleMobile = {
  ...menuPanelStyleMobile,
  left: 0,
  right: 0,
  minWidth: "auto",
  padding: "1.25rem 1rem",
  alignItems: "center",
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
  const [languagePanelOpen, setLanguagePanelOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const openLanguagePanel = () => {
    setMenuOpen(false);
    setLanguagePanelOpen((prev) => !prev);
  };

  const openMenu = () => {
    setLanguagePanelOpen(false);
    setMenuOpen((prev) => !prev);
  };

  const apiDocsUrl = getApiDocsUrl();
  const apiDocsLinkStyle = { ...homeLinkStyle, gap: "0.35rem" };

  const rightContent = (
    <>
      {isLoggedIn && user?.name && (
        <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.95rem" }}>
          {t("common.helloUser", { name: user.name })}
        </span>
      )}
      <button
        type="button"
        style={hamburgerButtonStyle}
        onClick={openLanguagePanel}
        aria-label={t("common.language")}
        aria-expanded={languagePanelOpen}
        title={t("common.language")}
      >
        {languageIcon}
      </button>
      {isLoggedIn && (
        <button type="button" style={logoutButtonStyle} onClick={handleLogout} title={t("common.logout")}>
          {logoutIcon}
          {t("common.logout")}
        </button>
      )}
    </>
  );

  const menuPanelContent = (
    <>
      {isLoggedIn && user?.name && (
        <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "1rem", padding: "0.5rem 0" }}>
          {t("common.helloUser", { name: user.name })}
        </span>
      )}
      <a
        href={apiDocsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...apiDocsLinkStyle, ...menuPanelItemMobileStyle }}
        title={t("common.apiDocs")}
        onClick={() => setMenuOpen(false)}
      >
        {docsIcon}
        {t("common.apiDocs")}
      </a>
      {isLoggedIn && (
        <button type="button" style={menuPanelButtonMobileStyle} onClick={handleLogout} title={t("common.logout")}>
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
        {isMobile ? (
          <>
            <div style={mobileLeftStyle}>
              <Link
                to="/"
                style={homeLinkStyle}
                title={t("common.home")}
                aria-label={t("common.home")}
              >
                {homeIcon}
              </Link>
            </div>
            <div style={mobileCenterStyle}>
              <button
                type="button"
                style={hamburgerButtonStyle}
                onClick={openLanguagePanel}
                aria-label={t("common.language")}
                aria-expanded={languagePanelOpen}
                title={t("common.language")}
              >
                {languageIcon}
              </button>
            </div>
            <div style={mobileRightStyle}>
              <button
                type="button"
                style={hamburgerButtonStyle}
                onClick={openMenu}
                aria-label="Menu"
                aria-expanded={menuOpen}
                title="Menu"
              >
                {hamburgerIcon}
              </button>
            </div>
            {languagePanelOpen && (
              <>
                <div
                  style={overlayStyle}
                  onClick={() => setLanguagePanelOpen(false)}
                  aria-hidden
                />
                <div style={languagePanelStyleMobile}>
                  <LanguageSwitcher variant="light" size="large" onLanguageChange={() => setLanguagePanelOpen(false)} />
                </div>
              </>
            )}
            {menuOpen && (
              <>
                <div
                  style={overlayStyle}
                  onClick={() => setMenuOpen(false)}
                  aria-hidden
                />
                <div style={menuPanelStyleMobile}>
                  {menuPanelContent}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={leftStyle}>
              <Link to="/" style={logoLinkStyle}>
                <img src="/SPS.png" alt="SPS Group" style={logoImgStyle} />
              </Link>
              <Link
                to="/"
                style={homeLinkStyle}
                title={t("common.home")}
                aria-label={t("common.home")}
              >
                {homeIcon}
              </Link>
              <a
                href={apiDocsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={apiDocsLinkStyle}
                title={t("common.apiDocs")}
                aria-label={t("common.apiDocs")}
              >
                {docsIcon}
                {t("common.apiDocs")}
              </a>
            </div>
            <div style={rightStyle}>
              {rightContent}
            </div>
            {languagePanelOpen && (
              <>
                <div
                  style={overlayStyle}
                  onClick={() => setLanguagePanelOpen(false)}
                  aria-hidden
                />
                <div style={{ ...menuPanelStyle, top: "56px", right: 0 }}>
                  <LanguageSwitcher variant="light" onLanguageChange={() => setLanguagePanelOpen(false)} />
                </div>
              </>
            )}
          </>
        )}
      </nav>
    </>
  );
}

export default Navbar;
