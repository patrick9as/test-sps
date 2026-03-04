describe("CRUD de usuários", () => {
  const adminEmail = "admin@spsgroup.com.br";
  const adminPassword = "1234";

  beforeEach(() => {
    cy.login(adminEmail, adminPassword);
  });

  it("cria um novo usuário: abre modal, preenche formulário, submete e vê o card na lista", () => {
    const name = "Usuário Cypress";
    const email = `cypress-${Date.now()}@example.com`;
    const password = "Teste@123";

    cy.get('button[aria-label="Novo usuário"]').click();
    cy.contains("Cadastrar usuário").should("be.visible");
    cy.get("#user-create-name").clear().type(name);
    cy.get("#user-create-email").clear().type(email);
    cy.get("#user-create-password").clear().type(password);
    cy.get("#user-create-confirm-password").clear().type(password);
    cy.contains("button", "Cadastrar").click();

    cy.contains("Usuário cadastrado.").should("be.visible");
    cy.contains(name).should("be.visible");
    cy.contains(email).should("be.visible");
  });

  it("edita um usuário: cria um usuário, clica em editar, altera nome, salva e vê nome atualizado na lista", () => {
    const name = "Usuário para Editar";
    const email = `edit-${Date.now()}@example.com`;
    const password = "Teste@123";

    cy.get('button[aria-label="Novo usuário"]').click();
    cy.get("#user-create-name").clear().type(name);
    cy.get("#user-create-email").clear().type(email);
    cy.get("#user-create-password").clear().type(password);
    cy.get("#user-create-confirm-password").clear().type(password);
    cy.contains("button", "Cadastrar").click();
    cy.contains("Usuário cadastrado.").should("be.visible");

    cy.contains("strong", name).parent().parent().within(() => {
      cy.get('a[title="Editar"]').click();
    });
    cy.url().should("match", /\/users\/[\w-]+/);
    cy.contains("Editar usuário").should("be.visible");

    const novoNome = "Nome Alterado Cypress";
    cy.get("#user-edit-name").clear().type(novoNome);
    cy.contains("button", "Salvar").click();

    cy.contains("Usuário atualizado.").should("be.visible");
    cy.url().should("include", "/users");
    cy.contains(novoNome).should("be.visible");
  });

  it("exclui um usuário: cria um usuário, clica em excluir, confirma no modal e vê toast e card removido", () => {
    const name = "Usuário para Excluir";
    const email = `delete-${Date.now()}@example.com`;
    const password = "Teste@123";

    cy.get('button[aria-label="Novo usuário"]').click();
    cy.get("#user-create-name").clear().type(name);
    cy.get("#user-create-email").clear().type(email);
    cy.get("#user-create-password").clear().type(password);
    cy.get("#user-create-confirm-password").clear().type(password);
    cy.contains("button", "Cadastrar").click();
    cy.contains("Usuário cadastrado.").should("be.visible");
    cy.contains(name).should("be.visible");

    cy.contains("strong", name).parent().parent().within(() => {
      cy.get('button[title="Excluir"]').click();
    });
    cy.contains("Confirmar exclusão").should("be.visible");
    cy.contains("button", "Excluir").click();
    cy.contains("Usuário excluído.").should("be.visible");
    cy.contains(name).should("not.exist");
  });
});
