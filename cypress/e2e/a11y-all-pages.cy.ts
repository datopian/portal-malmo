import { logA11yViolations } from "../support/axe-logger";

type RouteFile = {
  routes: string[];
};

describe("Accessibility (WCAG 2.2 AA) - all pages", () => {
  let routes: string[] = [];

  before(() => {
    cy.readFile<RouteFile>("public/__routes.json").then((data) => {
      routes = data.routes || [];
      expect(routes.length, "routes discovered").to.be.greaterThan(0);
    });
  });

  it("should have no a11y violations on all discovered routes", () => {
    routes.forEach((route) => {
      cy.visit(route);
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

          const summary = violations.map((v) => {
            console.log(v.nodes);
            return {
              id: v.id,
              impact: v.impact,
              description: v.description,
              help: v.help,
              nodes: v.nodes.length,
              
            };
          });

          logA11yViolations(violations);

          // screenshot helps a ton when running headless/CI
          const safe = route.replaceAll("/", "_").replaceAll("@", "_at_") || "home";
          cy.screenshot(`a11y-${safe}`, { capture: "viewport" });

          console.table(summary);

          // Throw to fail the test
          throw new Error(
            `A11y violations found on ${route}: ${violations.length}`
          );
        }
      );
    });
  });
});
