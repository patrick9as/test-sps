/**
 * Página de login (SignIn).
 * Exibe formulário de email/senha, logo SPS, seletor de idioma e redireciona
 * usuários já autenticados. No mobile: layout centralizado e bandeiras fixas no rodapé.
 */
import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import useMediaQuery from "../hooks/useMediaQuery";
import Card from "../components/Card";
import LanguageSwitcher from "../components/LanguageSwitcher";

/* Estilos do container principal (desktop: tudo centralizado; mobile: padding inferior para a barra de idiomas) */
const wrapperStyle = {
  position: "fixed",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
  boxSizing: "border-box",
  margin: 0,
  background: "linear-gradient(to bottom right, #2f73b2, #000)",
};

const wrapperStyleMobile = {
  ...wrapperStyle,
  padding: "0.75rem 1rem 5.5rem 1rem",
  justifyContent: "center",
  overflowY: "auto",
};

const languageSwitcherWrapperStyle = {
  position: "absolute",
  top: "1rem",
  right: "1rem",
};

/* Barra fixa no rodapé no mobile com as bandeiras de idioma */
const languageBarMobileStyle = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  padding: "1rem",
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  boxSizing: "border-box",
};

/* Estilos do formulário */
const formGroupStyle = { marginBottom: "1rem" };
const labelStyle = { display: "block", marginBottom: "0.25rem" };
const inputStyle = {
  width: "100%",
  padding: "0.35rem 0.75rem",
  boxSizing: "border-box",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "0.9rem",
};
const inputStyleMobile = {
  ...inputStyle,
  minHeight: "44px",
  fontSize: "16px",
};
const buttonStyle = {
  width: "100%",
  padding: "0.5rem 1rem",
  marginTop: "0.5rem",
  backgroundColor: "#2f73b2",
  color: "#fff",
  border: "none",
  borderRadius: "9999px",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "1rem",
};
const buttonStyleMobile = {
  ...buttonStyle,
  minHeight: "44px",
  padding: "0.75rem 1rem",
};

function SignIn() {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();
  const { t } = useLanguage();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [remainingAttempts, setRemainingAttempts] = useState(null);

  if (isLoggedIn) {
    return <Navigate to="/users" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setRemainingAttempts(null);
    try {
      await login({ email, password });
      navigate("/users", { replace: true });
    } catch (err) {
      /* Exibe mensagem de erro e, se vier do backend, tentativas restantes (rate limit) */
      const key = err.response?.data?.error;
      const remaining = err.response?.data?.remaining;
      setError(key ? t(key) : t("login.errorGeneric"));
      setRemainingAttempts(typeof remaining === "number" ? remaining : null);
    }
  };

  const logoStyle = isMobile
    ? { marginBottom: "1.5rem", maxWidth: "18rem", height: "auto", display: "block", marginLeft: "auto", marginRight: "auto" }
    : { marginBottom: "4rem", maxWidth: "24rem", height: "auto" };

  const cardWrapperStyleMobile = { width: "100%", maxWidth: "100%", display: "flex", justifyContent: "center" };

  return (
    <div style={isMobile ? wrapperStyleMobile : wrapperStyle}>
      {!isMobile && (
        <div style={languageSwitcherWrapperStyle}>
          <LanguageSwitcher variant="light" />
        </div>
      )}
      <img src="/SPS.png" alt="SPS" style={logoStyle} />
      <div style={isMobile ? cardWrapperStyleMobile : undefined}>
        <Card
          title={t("login.title")}
          minWidth={isMobile ? undefined : "320px"}
          padding={isMobile ? "2rem 1.25rem" : undefined}
          borderRadius={isMobile ? "16px" : undefined}
          style={isMobile ? { width: "100%" } : undefined}
        >
        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label htmlFor="email" style={labelStyle}>
              {t("login.emailLabel")}
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              style={isMobile ? inputStyleMobile : inputStyle}
            />
          </div>
          <div style={formGroupStyle}>
            <label htmlFor="password" style={labelStyle}>
              {t("login.passwordLabel")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={isMobile ? inputStyleMobile : inputStyle}
            />
          </div>
          {error && (
            <div style={{ marginBottom: "0.75rem" }}>
              <p style={{ color: "#c00", fontSize: "0.9rem", margin: 0 }}>
                {error}
              </p>
              {remainingAttempts !== null && (
                <p style={{ color: "#666", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>
                  {t("login.attemptsRemaining", { count: remainingAttempts })}
                </p>
              )}
            </div>
          )}
          <button type="submit" style={isMobile ? buttonStyleMobile : buttonStyle}>
            {t("login.submit")}
          </button>
        </form>
      </Card>
      </div>
      {isMobile && (
        <div style={languageBarMobileStyle}>
          <LanguageSwitcher variant="light" size="large" />
        </div>
      )}
    </div>
  );
}

export default SignIn;
