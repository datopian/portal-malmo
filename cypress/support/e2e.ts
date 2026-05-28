import "cypress-axe";

type InjectAxeOptions = {
  axeCorePath?: string;
};

// CI can occasionally be slow reading axe-core from node_modules on the first
// route. Keep the same cypress-axe behavior, but give the file read a more
// realistic timeout so the a11y test fails on real violations instead.
Cypress.Commands.overwrite(
  "injectAxe",
  (_originalFn, injectOptions?: InjectAxeOptions) => {
    const fileName = injectOptions?.axeCorePath ?? "node_modules/axe-core/axe.min.js";

    cy.readFile(fileName, { log: false, timeout: 15000 }).then((source) => {
      cy.window({ log: false }).then((win) => {
        win.eval(source);
      });
    });
  },
);
