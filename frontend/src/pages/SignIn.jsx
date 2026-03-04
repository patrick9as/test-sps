import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/Card";

const centerStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
  boxSizing: "border-box",
};

const formGroupStyle = { marginBottom: "1rem" };
const labelStyle = { display: "block", marginBottom: "0.25rem" };
const inputStyle = { width: "100%", padding: "0.5rem", boxSizing: "border-box" };
const buttonStyle = { width: "100%", padding: "0.5rem 1rem", marginTop: "0.5rem" };

function SignIn() {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isLoggedIn) {
    return <Navigate to="/users" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login({ email, password });
    navigate("/users", { replace: true });
  };

  return (
    <div style={centerStyle}>
      <Card title="Página de Login">
        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label htmlFor="email" style={labelStyle}>
              Email ou usuário
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
              Senha
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
          <button type="submit" style={buttonStyle}>
            Entrar
          </button>
        </form>
      </Card>
    </div>
  );
}

export default SignIn;
