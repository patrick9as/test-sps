import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import UserService from "../services/UserService";
import { useLanguage } from "../contexts/LanguageContext";
import Grid from "../components/Grid";
import Card from "../components/Card";

const pageStyle = {
  padding: "0.5rem 0",
  minHeight: "100vh",
  boxSizing: "border-box",
};

const titleStyle = { marginTop: 0, marginBottom: "1.5rem" };

const linkStyle = { color: "#2f73b2", textDecoration: "none", fontSize: "0.9rem" };

const deleteButtonStyle = {
  padding: 0,
  border: "none",
  background: "none",
  cursor: "pointer",
  color: "#c00",
  display: "inline-flex",
  alignItems: "center",
};

const pencilIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const closeIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

function Users() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDelete = async (user) => {
    try {
      await UserService.delete(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success(t("users.deleted"));
    } catch (err) {
      const key = err.response?.data?.error;
      toast.error(key ? t(key) : t("internal.server_error"));
    }
  };

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

  if (loading) {
    return (
      <div style={pageStyle}>
        <h1 style={titleStyle}>{t("users.pageTitle")}</h1>
        <p>{t("users.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <h1 style={titleStyle}>{t("users.pageTitle")}</h1>
        <p style={{ color: "#c00" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>{t("users.pageTitle")}</h1>
      {users.length === 0 ? (
        <p>{t("users.empty")}</p>
      ) : (
        <Grid
          items={users}
          renderItem={(user) => (
            <Card
              padding="1rem"
              borderRadius="8px"
              boxShadow="0 1px 4px rgba(0,0,0,0.1)"
              border="1px solid #eee"
              minWidth={undefined}
            >
              <div style={{ position: "relative", paddingRight: "3rem" }}>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <Link
                    to={`/users/${user.id}`}
                    style={{
                      ...linkStyle,
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                    title={t("users.edit")}
                  >
                    {pencilIcon}
                  </Link>
                  <button
                    type="button"
                    style={deleteButtonStyle}
                    onClick={() => handleDelete(user)}
                    title={t("users.delete")}
                    aria-label={t("users.delete")}
                  >
                    {closeIcon}
                  </button>
                </div>
                <div><strong>{user.name}</strong></div>
                <div style={{ marginTop: "0.25rem", fontSize: "0.9rem" }}>{user.email}</div>
                <div style={{ marginTop: "0.25rem", fontSize: "0.85rem", color: "#666" }}>{user.type}</div>
              </div>
            </Card>
          )}
        />
      )}
    </div>
  );
}

export default Users;
