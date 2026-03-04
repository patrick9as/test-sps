import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import Card from "../components/Card";
import LanguageSwitcher from "../components/LanguageSwitcher";

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

const languageSwitcherWrapperStyle = {
  position: "absolute",
  top: "1rem",
  right: "1rem",
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
  const { t } = useLanguage();
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
      const key = err.response?.data?.error;
      const remaining = err.response?.data?.remaining;
      setError(key ? t(key) : t("login.errorGeneric"));
      setRemainingAttempts(typeof remaining === "number" ? remaining : null);
    }
  };

  return (
    <div style={wrapperStyle}>
      <div style={languageSwitcherWrapperStyle}>
        <LanguageSwitcher variant="light" />
      </div>
      <img src="/SPS.png" alt="SPS" style={{ marginBottom: "4rem", maxWidth: "24rem", height: "auto" }} />
      <Card title={t("login.title")} minWidth="320px">
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
          <button type="submit" style={buttonStyle}>
            {t("login.submit")}
          </button>
        </form>
      </Card>
    </div>
  );
}

export default SignIn;
