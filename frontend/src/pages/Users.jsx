import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserService from "../services/UserService";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import Grid from "../components/Grid";
import LanguageSwitcher from "../components/LanguageSwitcher";

const pageStyle = {
  padding: "1.5rem 2rem",
  position: "relative",
  minHeight: "100vh",
  boxSizing: "border-box",
};

const titleStyle = { marginTop: 0, marginBottom: "1.5rem" };

const cardStyle = {
  padding: "1rem",
  borderRadius: "8px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  backgroundColor: "#fff",
  border: "1px solid #eee",
};

const linkStyle = { color: "#2f73b2", textDecoration: "none", fontSize: "0.9rem" };

const logoutButtonStyle = {
  marginLeft: "1rem",
  padding: "0.35rem 0.75rem",
  fontSize: "0.9rem",
  border: "1px solid #ccc",
  borderRadius: "6px",
  background: "#fff",
  cursor: "pointer",
  color: "#333",
};

function Users() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    UserService.list()
      .then((response) => {
        if (!cancelled) {
          setUsers(response.data.data || []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Erro ao carregar usuários.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const headerActions = (
    <div style={{ position: "absolute", top: "1rem", right: "1rem", display: "flex", alignItems: "center" }}>
      <LanguageSwitcher variant="dark" />
      <button type="button" style={logoutButtonStyle} onClick={handleLogout}>
        {t("common.logout")}
      </button>
    </div>
  );

  if (loading) {
    return (
      <div style={pageStyle}>
        {headerActions}
        <h1 style={titleStyle}>{t("users.pageTitle")}</h1>
        <p>{t("users.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        {headerActions}
        <h1 style={titleStyle}>{t("users.pageTitle")}</h1>
        <p style={{ color: "#c00" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {headerActions}
      <h1 style={titleStyle}>{t("users.pageTitle")}</h1>
      {users.length === 0 ? (
        <p>{t("users.empty")}</p>
      ) : (
        <Grid
          items={users}
          renderItem={(user) => (
            <div style={cardStyle}>
              <div><strong>{user.name}</strong></div>
              <div style={{ marginTop: "0.25rem", fontSize: "0.9rem" }}>{user.email}</div>
              <div style={{ marginTop: "0.25rem", fontSize: "0.85rem", color: "#666" }}>{user.type}</div>
              <Link to={`/users/${user.id}`} style={{ ...linkStyle, display: "inline-block", marginTop: "0.5rem" }}>
                Editar
              </Link>
            </div>
          )}
        />
      )}
    </div>
  );
}

export default Users;
