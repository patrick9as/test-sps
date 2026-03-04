import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import UserService from "../services/UserService";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import Grid from "../components/Grid";
import Card from "../components/Card";
import Modal from "../components/Modal";
import UserFormFields from "../components/UserFormFields";

const pageStyle = {
  padding: "0.5rem 0",
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

const fabStyle = {
  position: "fixed",
  right: "1.5rem",
  bottom: "1.5rem",
  width: "80px",
  height: "80px",
  minWidth: "80px",
  minHeight: "80px",
  borderRadius: "50%",
  backgroundColor: "#2f73b2",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "2.5rem",
  lineHeight: 1,
  zIndex: 1000,
  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
};

const submitButtonStyle = {
  padding: "0.65rem 1.75rem",
  marginTop: "0.5rem",
  backgroundColor: "#2f73b2",
  color: "#fff",
  border: "none",
  borderRadius: "9999px",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "1.1rem",
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
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createType, setCreateType] = useState("user");
  const [createPassword, setCreatePassword] = useState("");
  const [createConfirmPassword, setCreateConfirmPassword] = useState("");

  const canChangeType = authUser?.type === "admin";

  const clearCreateForm = () => {
    setCreateName("");
    setCreateEmail("");
    setCreateType("user");
    setCreatePassword("");
    setCreateConfirmPassword("");
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (createPassword !== createConfirmPassword) return;
    try {
      const response = await UserService.create({
        name: createName,
        email: createEmail,
        type: createType,
        password: createPassword,
      });
      toast.success(t("users.created"));
      setUsers((prev) => [...prev, response.data.data]);
      setModalOpen(false);
      clearCreateForm();
    } catch (err) {
      const key = err.response?.data?.error;
      const data = err.response?.data?.data;
      const isPasswordValidation =
        key === "validation.invalid_body" &&
        Array.isArray(data) &&
        data?.some((item) => item.path === "password");
      const message = isPasswordValidation
        ? t("validation.password_requirements_not_met")
        : key
          ? t(key)
          : t("internal.server_error");
      toast.error(message);
    }
  };

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

  const handleCreateFieldChange = (field, value) => {
    if (field === "name") setCreateName(value);
    else if (field === "email") setCreateEmail(value);
    else if (field === "type") setCreateType(value);
    else if (field === "password") setCreatePassword(value);
    else if (field === "confirmPassword") setCreateConfirmPassword(value);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    clearCreateForm();
  };

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>{t("users.pageTitle")}</h1>
      {!loading && !error && (
        <button
          type="button"
          style={fabStyle}
          onClick={() => setModalOpen(true)}
          title={t("users.newUser")}
          aria-label={t("users.newUser")}
        >
          +
        </button>
      )}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title={t("users.createTitle")}
      >
        <form onSubmit={handleCreateSubmit}>
          <UserFormFields
            mode="create"
            values={{
              name: createName,
              email: createEmail,
              type: createType,
              password: createPassword,
              confirmPassword: createConfirmPassword,
            }}
            onChange={handleCreateFieldChange}
            canChangeType={canChangeType}
            idPrefix="user-create"
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
            <button type="submit" style={submitButtonStyle}>
              {t("users.register")}
            </button>
          </div>
        </form>
      </Modal>
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
