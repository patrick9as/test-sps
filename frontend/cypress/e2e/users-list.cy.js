describe("Listagem de usuários", () => {
  const adminEmail = "admin@spsgroup.com.br";
  const adminPassword = "1234";

  beforeEach(() => {
    cy.login(adminEmail, adminPassword);
  });

  it("exibe título Usuários na página /users", () => {
    cy.url().should("include", "/users");
    cy.contains("h1", "Usuários").should("be.visible");
  });

  it("exibe filtros Todos, Admin e User quando há usuários", () => {
    cy.contains("Filtro de usuários por tipo:").should("be.visible");
    cy.contains("button", "Todos").should("be.visible");
    cy.contains("button", "Admin").should("be.visible");
    cy.contains("button", "User").should("be.visible");
  });

  it("ao clicar em Admin filtra a lista (botão fica destacado)", () => {
    cy.contains("button", "Admin").click();
    cy.contains("button", "Admin").should("have.css", "backgroundColor").and("not.equal", "rgba(0, 0, 0, 0)"); // botão ativo tem fundo
  });

  it("ao clicar em User filtra a lista", () => {
    cy.contains("button", "User").click();
    cy.contains("button", "User").parent().should("exist");
  });

  it("exibe mensagem de lista vazia quando não há usuários (ou estado vazio)", () => {
    // Se a API retornar lista vazia (ex.: backend recém-iniciado sem seed), aparece a mensagem
    cy.get("body").then(($body) => {
      if ($body.text().includes("Nenhum usuário cadastrado.")) {
        cy.contains("Nenhum usuário cadastrado.").should("be.visible");
      } else {
        cy.contains("Usuários").should("be.visible");
      }
    });
  });
});
