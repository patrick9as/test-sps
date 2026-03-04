import React, { useState } from "react";
import { useLoaderData, useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import UserService from "../services/UserService";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

const pageStyle = {
  padding: "0.5rem 0",
  minHeight: "100vh",
  boxSizing: "border-box",
};

const titleStyle = { marginTop: 0, marginBottom: "1.5rem" };

const formGroupStyle = { marginBottom: "1rem" };
const labelStyle = { display: "block", marginBottom: "0.25rem" };
const inputStyle = {
  width: "100%",
  maxWidth: "400px",
  padding: "0.35rem 0.75rem",
  boxSizing: "border-box",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "0.9rem",
};
const buttonStyle = {
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
const linkStyle = { color: "#2f73b2", textDecoration: "none", fontSize: "0.9rem" };

export async function userLoader({ params }) {
  try {
    const response = await UserService.get(params.userId);
    return { user: response.data.data };
  } catch (err) {
    if (err.response?.status === 404) return { user: null };
    throw err;
  }
}

function EditUser() {
  const { user } = useLoaderData();
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [type, setType] = useState(user?.type ?? "user");
  const [password, setPassword] = useState("");

  const isAdmin = authUser?.type === "admin";
  const canChangeType = isAdmin;

  if (user === null) {
    return (
      <div style={pageStyle}>
        <h1 style={titleStyle}>{t("users.editTitle")}</h1>
        <p style={{ color: "#c00" }}>{t("users.not_found")}</p>
        <Link to="/users" style={linkStyle}>
          ← {t("users.pageTitle")}
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = { name, email, type };
    if (password.trim()) body.password = password;
    try {
      await UserService.update(userId, body);
      toast.success(t("users.updated"));
      if (authUser?.id === userId) {
        updateUser({ name, email, type });
      }
      navigate("/users", { replace: true });
    } catch (err) {
      const key = err.response?.data?.error;
      toast.error(key ? t(key) : t("internal.server_error"));
    }
  };

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>{t("users.editTitle")}</h1>
      <form onSubmit={handleSubmit}>
        <div style={formGroupStyle}>
          <label htmlFor="user-edit-name" style={labelStyle}>
            {t("users.name")}
          </label>
          <input
            id="user-edit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div style={formGroupStyle}>
          <label htmlFor="user-edit-email" style={labelStyle}>
            {t("users.email")}
          </label>
          <input
            id="user-edit-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div style={formGroupStyle}>
          <label htmlFor="user-edit-type" style={labelStyle}>
            {t("users.type")}
          </label>
          <select
            id="user-edit-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={!canChangeType}
            style={{ ...inputStyle, cursor: canChangeType ? "pointer" : "default" }}
          >
            <option value="user">{t("users.typeUser")}</option>
            <option value="admin">{t("users.typeAdmin")}</option>
          </select>
        </div>
        <div style={formGroupStyle}>
          <label htmlFor="user-edit-password" style={labelStyle}>
            {t("users.newPasswordOptional")}
          </label>
          <input
            id="user-edit-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            style={inputStyle}
          />
        </div>
        <button type="submit" style={buttonStyle}>
          {t("users.save")}
        </button>
      </form>
      
    </div>
  );
}

export default EditUser;
