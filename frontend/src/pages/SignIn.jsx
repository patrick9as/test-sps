import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import Card from "../components/Card";

const centerStyle = {
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

function SignIn() {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();
  const { t, locale, setLanguage } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  if (isLoggedIn) {
    return <Navigate to="/users" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      navigate("/users", { replace: true });
    } catch (err) {
      const key = err.response?.data?.error;
      setError(key ? t(key) : t("login.errorGeneric"));
    }
  };

  const FLAGS = {
  "pt-BR": "https://paises.ibge.gov.br/img/bandeiras/BR.gif",
  es: "https://paises.ibge.gov.br/img/bandeiras/ES.gif",
  en: "https://paises.ibge.gov.br/img/bandeiras/US.gif",
};

const langButtonStyle = (active) => ({
  marginLeft: "0.25rem",
  padding: "2px",
  border: "1px solid rgba(255,255,255,0.6)",
  borderRadius: "4px",
  background: active ? "rgba(255,255,255,0.25)" : "transparent",
  cursor: "pointer",
});

const flagImgStyle = { display: "block", width: "24px", height: "16px", objectFit: "cover" };

  return (
    <div style={centerStyle}>
      <div style={{ position: "absolute", top: "1rem", right: "1rem", display: "flex", alignItems: "center" }}>
        <button type="button" style={langButtonStyle(locale === "pt-BR")} onClick={() => setLanguage("pt-BR")} title="Português">
          <img src={FLAGS["pt-BR"]} alt="PT" style={flagImgStyle} />
        </button>
        <button type="button" style={langButtonStyle(locale === "es")} onClick={() => setLanguage("es")} title="Español">
          <img src={FLAGS.es} alt="ES" style={flagImgStyle} />
        </button>
        <button type="button" style={langButtonStyle(locale === "en")} onClick={() => setLanguage("en")} title="English">
          <img src={FLAGS.en} alt="EN" style={flagImgStyle} />
        </button>
      </div>
      <img src="/SPS.png" alt="SPS" style={{ marginBottom: "4rem", maxWidth: "24rem", height: "auto" }} />
      <Card title={t("login.title")}>
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
              style={inputStyle}
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
              style={inputStyle}
            />
          </div>
          {error && (
            <p style={{ color: "#c00", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
              {error}
            </p>
          )}
          <button type="submit" style={buttonStyle}>
            {t("login.submit")}
          </button>
        </form>
      </Card>
    </div>
  );
}

export default SignIn;
