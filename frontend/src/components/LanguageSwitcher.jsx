import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

const FLAGS = {
  "pt-BR": "https://paises.ibge.gov.br/img/bandeiras/BR.gif",
  es: "https://paises.ibge.gov.br/img/bandeiras/ES.gif",
  en: "https://paises.ibge.gov.br/img/bandeiras/US.gif",
};

const langButtonStyle = (active) => ({
  marginLeft: "0.25rem",
  padding: "2px",
  border: "1px solid rgba(255,255,255,0.6)",
  borderRadius: "4px",
  background: active ? "rgba(255,255,255,0.25)" : "transparent",
  cursor: "pointer",
});

const flagImgStyle = { display: "block", width: "24px", height: "16px", objectFit: "cover" };
const flagImgStyleLarge = { display: "block", width: "56px", height: "38px", objectFit: "cover" };

function LanguageSwitcher({ variant = "light", onLanguageChange, size = "normal" }) {
  const { locale, setLanguage } = useLanguage();
  const isLarge = size === "large";

  const borderColor = variant === "dark" ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.6)";
  const bgActive = variant === "dark" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.25)";

  const buttonStyle = (active) => ({
    ...langButtonStyle(active),
    borderColor,
    background: active ? bgActive : "transparent",
    padding: isLarge ? "6px" : "2px",
  });

  const handleSelect = (lang) => {
    setLanguage(lang);
    onLanguageChange?.(lang);
  };

  const containerStyle = {
    display: "flex",
    alignItems: "center",
    gap: isLarge ? "1rem" : "0.25rem",
    justifyContent: isLarge ? "center" : undefined,
    width: isLarge ? "100%" : undefined,
  };

  return (
    <div style={containerStyle}>
      <button type="button" style={buttonStyle(locale === "pt-BR")} onClick={() => handleSelect("pt-BR")} title="Português">
        <img src={FLAGS["pt-BR"]} alt="PT" style={isLarge ? flagImgStyleLarge : flagImgStyle} />
      </button>
      <button type="button" style={buttonStyle(locale === "es")} onClick={() => handleSelect("es")} title="Español">
        <img src={FLAGS.es} alt="ES" style={isLarge ? flagImgStyleLarge : flagImgStyle} />
      </button>
      <button type="button" style={buttonStyle(locale === "en")} onClick={() => handleSelect("en")} title="English">
        <img src={FLAGS.en} alt="EN" style={isLarge ? flagImgStyleLarge : flagImgStyle} />
      </button>
    </div>
  );
}

export default LanguageSwitcher;
