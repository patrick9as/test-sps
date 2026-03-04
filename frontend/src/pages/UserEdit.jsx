import React, { useState, useEffect } from "react";
import { useLoaderData, useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import UserService from "../services/UserService";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import useMediaQuery from "../hooks/useMediaQuery";
import UserFormFields from "../components/UserFormFields";

const pageStyle = {
  padding: "0.5rem 0",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const contentWrapperStyle = {
  width: "100%",
  maxWidth: "400px",
};

const titleStyle = { marginTop: 0, marginBottom: 0 };

const headerRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1.5rem",
  flexWrap: "wrap",
  gap: "0.75rem",
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

const saveBarStyleMobile = {
  position: "fixed",
  bottom: "56px",
  left: 0,
  right: 0,
  padding: "0.75rem 1rem",
  backgroundColor: "#fff",
  boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
  boxSizing: "border-box",
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
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isAdmin = authUser?.type === "admin";
  const canChangeType = isAdmin;
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    if (authUser != null && authUser.type !== "admin") {
      toast.error(t("users.only_admin_can_modify_others"));
      navigate("/users", { replace: true });
    }
  }, [authUser, navigate, t]);

  if (authUser != null && authUser.type !== "admin") {
    return null;
  }

  if (user === null) {
    return (
      <div style={pageStyle}>
        <div style={contentWrapperStyle}>
          <h1 style={titleStyle}>{t("users.editTitle")}</h1>
          <p style={{ color: "#c00" }}>{t("users.not_found")}</p>
          <Link to="/users" style={linkStyle}>
            ← {t("users.pageTitle")}
          </Link>
        </div>
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

  const handleFieldChange = (field, value) => {
    if (field === "name") setName(value);
    else if (field === "email") setEmail(value);
    else if (field === "type") setType(value);
    else if (field === "password") setPassword(value);
    else if (field === "confirmPassword") setConfirmPassword(value);
  };

  return (
    <div style={pageStyle}>
      <div style={{ ...contentWrapperStyle, paddingBottom: isMobile ? "7rem" : undefined }}>
        <form onSubmit={handleSubmit} id="user-edit-form">
          <div style={headerRowStyle}>
            <h1 style={titleStyle}>{t("users.editTitle")}</h1>
            {!isMobile && (
              <button type="submit" style={submitButtonStyle}>
                {t("users.save")}
              </button>
            )}
          </div>
          <UserFormFields
            mode="edit"
            values={{ name, email, type, password, confirmPassword }}
            onChange={handleFieldChange}
            showPasswordFields={showPasswordFields}
            onShowPasswordFields={() => setShowPasswordFields(true)}
            canChangeType={canChangeType}
            idPrefix="user-edit"
          />
        </form>
      </div>
      {isMobile && (
        <div style={saveBarStyleMobile}>
          <button type="submit" form="user-edit-form" style={{ ...submitButtonStyle, marginTop: 0, width: "100%", maxWidth: "400px" }}>
            {t("users.save")}
          </button>
        </div>
      )}
    </div>
  );
}

export default EditUser;
