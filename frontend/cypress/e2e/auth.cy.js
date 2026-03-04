describe("Autenticação", () => {
  const adminEmail = "admin@spsgroup.com.br";
  const adminPassword = "1234";

  it("faz login com credenciais válidas e redireciona para /users", () => {
    cy.visitApp("/login");
    cy.get("#email").clear().type(adminEmail);
    cy.get("#password").clear().type(adminPassword);
    cy.contains("button", "Entrar").click();
    cy.url().should("include", "/users");
    cy.contains("h1", "Usuários").should("be.visible");
  });

  it("exibe mensagem de erro com senha inválida", () => {
    cy.visitApp("/login");
    cy.get("#email").clear().type(adminEmail);
    cy.get("#password").clear().type("senhaerrada");
    cy.contains("button", "Entrar").click();
    cy.url().should("include", "/login");
    cy.contains("Email ou senha inválidos").should("be.visible");
  });

  it("redireciona para /login ao acessar / sem estar logado", () => {
    cy.visitApp("/");
    cy.url().should("include", "/login");
    cy.contains("Login").should("be.visible");
  });

  it("redireciona para /login ao acessar /users sem estar logado", () => {
    cy.visitApp("/users");
    cy.url().should("include", "/login");
    cy.contains("Login").should("be.visible");
  });

  it("após login, logout redireciona para /login e /users exige login de novo", () => {
    cy.login(adminEmail, adminPassword);
    cy.url().should("include", "/users");
    cy.contains("button", "Sair").click();
    cy.url().should("include", "/login");
    cy.visitApp("/users");
    cy.url().should("include", "/login");
  });
});
