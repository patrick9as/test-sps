/**
 * Campos reutilizáveis de usuário: nome, email, tipo (admin/user), senha e confirmar senha.
 * Modos: "create" (cadastro) e "edit" (edição, com link "Alterar senha"). Exibe barra de
 * requisitos da senha e validação em tempo real.
 */
import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

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
const secondaryButtonStyle = {
  padding: "0.5rem 1rem",
  marginTop: "0.5rem",
  backgroundColor: "transparent",
  color: "#2f73b2",
  border: "1px solid #2f73b2",
  borderRadius: "9999px",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "1rem",
};
const buttonsCenterStyle = { display: "flex", justifyContent: "center" };
const passwordBarTrackStyle = {
  width: "100%",
  maxWidth: "400px",
  height: "8px",
  backgroundColor: "#e0e0e0",
  borderRadius: "4px",
  overflow: "hidden",
  marginTop: "0.5rem",
};
const requirementRowStyle = { display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.25rem", fontSize: "0.85rem" };

/* Verifica se a senha atende a cada requisito (tamanho, número, maiúscula, minúscula, especial) */
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

function passwordBarFillStyle(percent) {
  return {
    height: "100%",
    width: `${percent}%`,
    backgroundColor: percent === 100 ? "#2e7d32" : "#2f73b2",
    borderRadius: "4px",
    transition: "width 0.2s ease",
  };
}

function UserFormFields({
  mode,
  values,
  onChange,
  showPasswordFields,
  onShowPasswordFields,
  canChangeType,
  idPrefix = "user-form",
}) {
  const { t } = useLanguage();
  const { name, email, type, password, confirmPassword } = values;

  const passwordReqs = getPasswordRequirements(password);
  const passwordMetCount = [
    passwordReqs.minLength,
    passwordReqs.number,
    passwordReqs.lowercase,
    passwordReqs.uppercase,
    passwordReqs.special,
  ].filter(Boolean).length;
  const passwordBarPercent = (passwordMetCount / 5) * 100;

  const handleChange = (field) => (e) => onChange(field, e.target.value);

  const renderPasswordSection = () => (
    <>
      <label htmlFor={`${idPrefix}-password`} style={labelStyle}>
        {mode === "create" ? t("users.newPasswordOptional") : t("users.newPasswordOptional")}
      </label>
      <input
        id={`${idPrefix}-password`}
        type="password"
        value={password}
        onChange={handleChange("password")}
        autoComplete="new-password"
        style={inputStyle}
        required={mode === "create"}
      />
      <div style={{ marginTop: "0.5rem", maxWidth: "400px" }}>
        <div style={passwordBarTrackStyle}>
          <div style={passwordBarFillStyle(passwordBarPercent)} />
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          {["minLength", "number", "lowercase", "uppercase", "special"].map((key) => (
            <div key={key} style={requirementRowStyle}>
              <span style={{ color: passwordReqs[key] ? "#2e7d32" : "#666" }}>
                {passwordReqs[key] ? "✓" : "○"}
              </span>
              <span style={{ color: passwordReqs[key] ? "#333" : "#666" }}>
                {t(`validation.password_${key === "minLength" ? "min_length" : key}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <label htmlFor={`${idPrefix}-confirm-password`} style={{ ...labelStyle, marginTop: "0.75rem" }}>
        {t("users.confirmNewPassword")}
      </label>
      <input
        id={`${idPrefix}-confirm-password`}
        type="password"
        value={confirmPassword}
        onChange={handleChange("confirmPassword")}
        autoComplete="new-password"
        style={inputStyle}
        required={mode === "create"}
      />
      {(password || confirmPassword) && password !== confirmPassword && (
        <p style={{ color: "#c00", marginTop: "0.5rem", fontSize: "0.9rem" }}>
          {t("users.passwordMismatch")}
        </p>
      )}
    </>
  );

  return (
    <>
      <div style={formGroupStyle}>
        <label htmlFor={`${idPrefix}-name`} style={labelStyle}>
          {t("users.name")}
        </label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          value={name}
          onChange={handleChange("name")}
          required
          style={inputStyle}
          autoFocus
        />
      </div>
      <div style={formGroupStyle}>
        <label htmlFor={`${idPrefix}-email`} style={labelStyle}>
          {t("users.email")}
        </label>
        <input
          id={`${idPrefix}-email`}
          type="email"
          value={email}
          onChange={handleChange("email")}
          required
          style={inputStyle}
        />
      </div>
      <div style={formGroupStyle}>
        <label htmlFor={`${idPrefix}-type`} style={labelStyle}>
          {t("users.type")}
        </label>
        <select
          id={`${idPrefix}-type`}
          value={type}
          onChange={handleChange("type")}
          disabled={!canChangeType}
          style={{ ...inputStyle, cursor: canChangeType ? "pointer" : "default" }}
        >
          <option value="user">{t("users.typeUser")}</option>
          <option value="admin">{t("users.typeAdmin")}</option>
        </select>
        {!canChangeType && (
          <p style={{ marginTop: "0.5rem", color: "#c44", fontSize: "0.9rem" }}>
            {t("users.only_admin_can_create_admin")}
          </p>
        )}
      </div>
      <div style={{ ...formGroupStyle, marginTop: "2rem" }}>
        {mode === "edit" && !showPasswordFields ? (
          <div style={buttonsCenterStyle}>
            <button type="button" style={secondaryButtonStyle} onClick={onShowPasswordFields}>
              {t("users.changePassword")}
            </button>
          </div>
        ) : (
          renderPasswordSection()
        )}
      </div>
    </>
  );
}

export default UserFormFields;
