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
const secondaryButtonStyle = {
  ...buttonStyle,
  backgroundColor: "transparent",
  color: "#2f73b2",
  border: "1px solid #2f73b2",
};
const linkStyle = { color: "#2f73b2", textDecoration: "none", fontSize: "0.9rem" };

function getPasswordRequirements(value) {
  const s = value || "";
  return {
    minLength: s.length >= 7,
    number: /[0-9]/.test(s),
    lowercase: /[a-z]/.test(s),
    uppercase: /[A-Z]/.test(s),
    special: /[^a-zA-Z0-9]/.test(s),
  };
}

const passwordBarTrackStyle = {
  width: "100%",
  maxWidth: "400px",
  height: "8px",
  backgroundColor: "#e0e0e0",
  borderRadius: "4px",
  overflow: "hidden",
  marginTop: "0.5rem",
};
const passwordBarFillStyle = (percent) => ({
  height: "100%",
  width: `${percent}%`,
  backgroundColor: percent === 100 ? "#2e7d32" : "#2f73b2",
  borderRadius: "4px",
  transition: "width 0.2s ease",
});
const requirementRowStyle = { display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.25rem", fontSize: "0.85rem" };

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
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isAdmin = authUser?.type === "admin";
  const canChangeType = isAdmin;
  const passwordReqs = getPasswordRequirements(password);
  const passwordMetCount = [
    passwordReqs.minLength,
    passwordReqs.number,
    passwordReqs.lowercase,
    passwordReqs.uppercase,
    passwordReqs.special,
  ].filter(Boolean).length;
  const passwordBarPercent = (passwordMetCount / 5) * 100;

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
    if (showPasswordFields && (password || confirmPassword) && password !== confirmPassword) {
      return;
    }
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
      const data = err.response?.data?.data;
      const isPasswordValidation =
        key === "validation.invalid_body" &&
        Array.isArray(data) &&
        data.some((item) => item.path === "password");
      const message = isPasswordValidation
        ? t("validation.password_requirements_not_met")
        : key
          ? t(key)
          : t("internal.server_error");
      toast.error(message);
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
          {!showPasswordFields ? (
            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={() => setShowPasswordFields(true)}
            >
              {t("users.changePassword")}
            </button>
          ) : (
            <>
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
              <div style={{ marginTop: "0.5rem", maxWidth: "400px" }}>
                <div style={passwordBarTrackStyle}>
                  <div style={passwordBarFillStyle(passwordBarPercent)} />
                </div>
                <div style={{ marginTop: "0.5rem" }}>
                  <div style={requirementRowStyle}>
                    <span style={{ color: passwordReqs.minLength ? "#2e7d32" : "#666" }}>
                      {passwordReqs.minLength ? "✓" : "○"}
                    </span>
                    <span style={{ color: passwordReqs.minLength ? "#333" : "#666" }}>
                      {t("validation.password_min_length")}
                    </span>
                  </div>
                  <div style={requirementRowStyle}>
                    <span style={{ color: passwordReqs.number ? "#2e7d32" : "#666" }}>
                      {passwordReqs.number ? "✓" : "○"}
                    </span>
                    <span style={{ color: passwordReqs.number ? "#333" : "#666" }}>
                      {t("validation.password_number")}
                    </span>
                  </div>
                  <div style={requirementRowStyle}>
                    <span style={{ color: passwordReqs.lowercase ? "#2e7d32" : "#666" }}>
                      {passwordReqs.lowercase ? "✓" : "○"}
                    </span>
                    <span style={{ color: passwordReqs.lowercase ? "#333" : "#666" }}>
                      {t("validation.password_lowercase")}
                    </span>
                  </div>
                  <div style={requirementRowStyle}>
                    <span style={{ color: passwordReqs.uppercase ? "#2e7d32" : "#666" }}>
                      {passwordReqs.uppercase ? "✓" : "○"}
                    </span>
                    <span style={{ color: passwordReqs.uppercase ? "#333" : "#666" }}>
                      {t("validation.password_uppercase")}
                    </span>
                  </div>
                  <div style={requirementRowStyle}>
                    <span style={{ color: passwordReqs.special ? "#2e7d32" : "#666" }}>
                      {passwordReqs.special ? "✓" : "○"}
                    </span>
                    <span style={{ color: passwordReqs.special ? "#333" : "#666" }}>
                      {t("validation.password_special")}
                    </span>
                  </div>
                </div>
              </div>
              <label htmlFor="user-edit-confirm-password" style={{ ...labelStyle, marginTop: "0.75rem" }}>
                {t("users.confirmNewPassword")}
              </label>
              <input
                id="user-edit-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                style={inputStyle}
              />
              {showPasswordFields && (password || confirmPassword) && password !== confirmPassword && (
                <p style={{ color: "#c00", marginTop: "0.5rem", fontSize: "0.9rem" }}>
                  {t("users.passwordMismatch")}
                </p>
              )}
            </>
          )}
        </div>
        <button type="submit" style={buttonStyle}>
          {t("users.save")}
        </button>
      </form>
      
    </div>
  );
}

export default EditUser;
