/**
 * Layout das rotas protegidas: exige login (redireciona para /login se não autenticado).
 * Renderiza Navbar + Outlet (conteúdo da rota). No mobile: wrapper com altura total da tela,
 * main rolável com padding inferior para navbar + FAB, e Navbar fixa no rodapé.
 */
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useMediaQuery from "../hooks/useMediaQuery";
import Navbar from "./Navbar";

const mainStyle = { padding: "1rem 1.5rem", boxSizing: "border-box" };

/* No mobile: container em coluna com altura mínima da viewport para o main preencher e rolar */
const wrapperStyleMobile = {
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
};

export default function ProtectedRoute() {
  const { isLoggedIn } = useAuth();
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  /* Mobile: main flexível com scroll e padding inferior (navbar 56px + espaço FAB 100px) */
  const style = isMobile
    ? {
        ...mainStyle,
        paddingBottom: "calc(1rem + 56px + 100px)",
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
      }
    : mainStyle;

  const content = (
    <>
      <main style={style}>
        <Outlet />
      </main>
      <Navbar />
    </>
  );

  return isMobile ? (
    <div style={wrapperStyleMobile}>{content}</div>
  ) : (
    <>
      <Navbar />
      <main style={mainStyle}>
        <Outlet />
      </main>
    </>
  );
}
