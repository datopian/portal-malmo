import { logA11yViolations } from "../support/axe-logger";

const routes = (Cypress.env("routes") as string[]) ?? [];

describe("Accessibility (WCAG 2.2 AA) – per page", () => {
  before(() => {
    expect(routes.length, "routes discovered").to.be.greaterThan(0);
  });

  routes.forEach((route) => {
    const url = String(route);

    it(`has no a11y violations: ${url}`, () => {
      cy.request({
        url,
        failOnStatusCode: false,
        followRedirect: true,
      }).then((resp) => {
        if (resp.status < 200 || resp.status >= 300) {
          cy.log(`Skipping ${url} (status ${resp.status})`);
          return;
        }

        cy.visit(url);
        cy.get("body").should("be.visible");

        cy.injectAxe();
        cy.checkA11y(
          undefined,
          {
            runOnly: {
              type: "tag",
              values: ["wcag2aa", "wcag21aa", "wcag22aa"],
            },
          },
          (violations) => {
            if (!violations?.length) return;

            logA11yViolations(violations);

            const safe =
              url.replaceAll("/", "_").replaceAll("@", "_at_") || "home";
            cy.screenshot(`a11y-${safe}`, { capture: "viewport" });

            throw new Error(
              `A11y violations found on ${url}: ${violations.length}`
            );
          }
        );
      });
    });
  });
});
