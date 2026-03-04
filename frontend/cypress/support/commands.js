const LOCALE_KEY = "app_locale";
const PT_BR = "pt-BR";

/**
 * Visita uma rota da aplicação com locale pt-BR forçado no localStorage (onBeforeLoad).
 * Use em todo teste que abre a aplicação para que a UI já carregue em português.
 * @param {string} [path='/'] - Caminho da rota (ex: '/login', '/users').
 */
Cypress.Commands.add("visitApp", (path = "/") => {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem(LOCALE_KEY, PT_BR);
    },
  });
});

/**
 * Faz login via UI: visita /login em pt-BR, preenche email e senha, clica em Entrar,
 * e espera redirecionamento para /users.
 * @param {string} email - Email do usuário (ex: admin@spsgroup.com.br).
 * @param {string} password - Senha (ex: 1234).
 */
Cypress.Commands.add("login", (email, password) => {
  cy.visitApp("/login");
  cy.get("#email").clear().type(email);
  cy.get("#password").clear().type(password);
  cy.contains("button", "Entrar").click();
  cy.url().should("include", "/users");
});
