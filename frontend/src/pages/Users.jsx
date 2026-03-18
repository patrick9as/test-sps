/**
 * Página de listagem de usuários (Users).
 * Lista usuários em cards, com filtro por tipo (Todos / Admin / User), FAB para novo usuário,
 * modal de criação, confirmação antes de excluir e links para edição. Layout responsivo (mobile: FAB e padding).
 */
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import UserService from "../services/UserService";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import useMediaQuery from "../hooks/useMediaQuery";
import Grid from "../components/Grid";
import Card from "../components/Card";
import Modal from "../components/Modal";
import UserFormFields from "../components/UserFormFields";
import api from "../services/api";

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

const fabStyleBase = {
  position: "fixed",
  right: "1.5rem",
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

const cancelButtonStyle = {
  padding: "0.5rem 1.25rem",
  marginRight: "0.5rem",
  backgroundColor: "transparent",
  color: "#555",
  border: "1px solid #ccc",
  borderRadius: "9999px",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "1rem",
};

const confirmDeleteButtonStyle = {
  ...submitButtonStyle,
  backgroundColor: "#c00",
  marginTop: 0,
};

const filterButtonBase = {
  padding: "0.4rem 0.9rem",
  fontFamily: "inherit",
  fontSize: "0.9rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
  cursor: "pointer",
  background: "transparent",
  color: "#555",
};
const filterButtonActive = {
  ...filterButtonBase,
  backgroundColor: "#2f73b2",
  borderColor: "#2f73b2",
  color: "#fff",
};

const avatarSize = 44;
const avatarStyle = {
  width: `${avatarSize}px`,
  height: `${avatarSize}px`,
  borderRadius: "9999px",
  objectFit: "cover",
  border: "1px solid #eee",
  flexShrink: 0,
  backgroundColor: "#f5f6f7",
};

const avatarFallbackStyle = {
  ...avatarStyle,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  color: "#2f73b2",
  fontSize: "0.95rem",
  textTransform: "uppercase",
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

const paperclipIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21.44 11.05l-8.49 8.49a5 5 0 0 1-7.07-7.07l8.49-8.49a3 3 0 1 1 4.24 4.24l-8.5 8.49a1 1 0 0 1-1.41-1.41l7.78-7.78" />
  </svg>
);

function Users() {
  const { t } = useLanguage();
  const { user: authUser } = useAuth();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createType, setCreateType] = useState("user");
  const [createPassword, setCreatePassword] = useState("");
  const [createConfirmPassword, setCreateConfirmPassword] = useState("");
  const [createProfilePicture, setCreateProfilePicture] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [profilePictureUrls, setProfilePictureUrls] = useState({});
  const profilePictureUrlsRef = useRef({});

  const canChangeType = authUser?.type === "admin";

  /* Lista filtrada por tipo (all / admin / user) para os botões de filtro */
  const filteredUsers =
    filterType === "all"
      ? users
      : users.filter((u) => u.type === filterType);

  const clearCreateForm = () => {
    setCreateName("");
    setCreateEmail("");
    setCreateType("user");
    setCreatePassword("");
    setCreateConfirmPassword("");
    setCreateProfilePicture(null);
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

      let createdUser = response.data.data;
      if (createProfilePicture instanceof File) {
        await UserService.uploadProfilePicture(createdUser.id, createProfilePicture);
        const refreshed = await UserService.get(createdUser.id);
        createdUser = refreshed.data.data;
      }

      toast.success(t("users.created"));
      setUsers((prev) => [...prev, createdUser]);
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
      setUserToDelete(null);
      toast.success(t("users.deleted"));
    } catch (err) {
      const key = err.response?.data?.error;
      toast.error(key ? t(key) : t("internal.server_error"));
    }
  };

  /* Carrega a lista de usuários ao montar a página */
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

  useEffect(() => {
    let cancelled = false;

    const usersWithPictures = (users || []).filter((u) => u?.profilePictureUrl);
    usersWithPictures.forEach((u) => {
      if (profilePictureUrlsRef.current[u.id]) return;

      api
        .get(u.profilePictureUrl, { responseType: "blob" })
        .then((resp) => {
          if (cancelled) return;
          const objectUrl = URL.createObjectURL(resp.data);
          profilePictureUrlsRef.current[u.id] = objectUrl;
          setProfilePictureUrls((prev) => ({ ...prev, [u.id]: objectUrl }));
        })
        .catch(() => {
          // silencioso: mantém fallback
        });
    });

    return () => {
      cancelled = true;
    };
  }, [users]);

  useEffect(() => {
    return () => {
      Object.values(profilePictureUrlsRef.current).forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      });
      profilePictureUrlsRef.current = {};
    };
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
    else if (field === "profilePicture") setCreateProfilePicture(value);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    clearCreateForm();
  };

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>{t("users.pageTitle")}</h1>
      {/* Filtro por tipo (Todos / Admin / User), só exibido quando há usuários */}
      {!loading && !error && users.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1rem" }}>
          <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.95rem", color: "#555" }}>
            {t("users.filterByTypeDescription")}
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              type="button"
              style={filterType === "all" ? filterButtonActive : filterButtonBase}
              onClick={() => setFilterType("all")}
            >
              {t("users.filterAll")}
            </button>
            <button
              type="button"
              style={filterType === "admin" ? filterButtonActive : filterButtonBase}
              onClick={() => setFilterType("admin")}
            >
              {t("users.filterAdmin")}
            </button>
            <button
              type="button"
              style={filterType === "user" ? filterButtonActive : filterButtonBase}
              onClick={() => setFilterType("user")}
            >
              {t("users.filterUser")}
            </button>
          </div>
        </div>
      )}
      {!loading && !error && (
        <button
          type="button"
          style={{
            ...fabStyleBase,
            bottom: isMobile ? "calc(56px + 1rem)" : "1.5rem",
          }}
          onClick={() => setModalOpen(true)}
          title={t("users.newUser")}
          aria-label={t("users.newUser")}
        >
          +
        </button>
      )}
      {/* Modal de confirmação antes de excluir um usuário */}
      <Modal
        open={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title={t("users.deleteConfirmTitle")}
      >
        <p style={{ margin: "0 0 1rem 0" }}>
          {userToDelete ? t("users.deleteConfirmMessage", { name: userToDelete.name }) : ""}
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <button type="button" style={cancelButtonStyle} onClick={() => setUserToDelete(null)}>
            {t("users.cancel")}
          </button>
          <button
            type="button"
            style={confirmDeleteButtonStyle}
            onClick={() => userToDelete && handleDelete(userToDelete)}
          >
            {t("users.delete")}
          </button>
        </div>
      </Modal>
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
              profilePicture: createProfilePicture,
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
      ) : filteredUsers.length === 0 ? (
        <p>{t("users.empty")}</p>
      ) : (
        <Grid
          items={filteredUsers}
          renderItem={(user) => (
            <Card
              padding="1rem"
              borderRadius="8px"
              boxShadow="0 1px 4px rgba(0,0,0,0.1)"
              border="1px solid #eee"
              minWidth={undefined}
            >
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <Link
                    to={`/users/${user.id}/attachments`}
                    style={{
                      ...linkStyle,
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                    title={t("attachments.pageTitle")}
                  >
                    {paperclipIcon}
                  </Link>
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
                    onClick={() => setUserToDelete(user)}
                    title={t("users.delete")}
                    aria-label={t("users.delete")}
                  >
                    {closeIcon}
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", paddingRight: "5rem" }}>
                  <div style={{ minWidth: 0 }}>
                    <div><strong>{user.name}</strong></div>
                    <div style={{ marginTop: "0.25rem", fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
                    <div style={{ marginTop: "0.25rem", fontSize: "0.85rem", color: "#666" }}>{user.type}</div>
                  </div>
                  {profilePictureUrls[user.id] ? (
                    <img
                      src={profilePictureUrls[user.id]}
                      alt={t("users.profilePicture")}
                      style={avatarStyle}
                    />
                  ) : (
                    <div style={avatarFallbackStyle} aria-label={t("users.profilePicture")}>
                      {(user?.name || "?")
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((s) => s[0])
                        .join("")}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        />
      )}
    </div>
  );
}

export default Users;
