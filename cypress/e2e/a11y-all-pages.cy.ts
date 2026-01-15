import { logA11yViolations } from "../support/axe-logger";

type RouteFile = {
  routes: string[];
};

describe("Accessibility (WCAG 2.2 AA) - all pages", () => {
  let routes: string[] = [];

  before(() => {
    cy.readFile<RouteFile>("public/__routes.json").then((data) => {
      routes = data.routes ?? [];
      expect(routes.length, "routes discovered").to.be.greaterThan(0);
    });
  });

  it("should have no a11y violations on all discovered routes", () => {
    const skipped: Array<{ route: string; status: number }> = [];

    cy.wrap(routes, { log: false }).each((route) => {
      const url = String(route);

      cy.request({
        url,
        failOnStatusCode: false,
        followRedirect: true,
      }).then((resp) => {
        if (resp.status < 200 || resp.status >= 300) {
          skipped.push({ route: url, status: resp.status });
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

            const summary = violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              description: v.description,
              help: v.help,
              nodes: v.nodes.length,
            }));

            logA11yViolations(violations);

            const safe =
              url.replaceAll("/", "_").replaceAll("@", "_at_") || "home";
            cy.screenshot(`a11y-${safe}`, { capture: "viewport" });

            // eslint-disable-next-line no-console
            console.table(summary);

            throw new Error(
              `A11y violations found on ${url}: ${violations.length}`
            );
          }
        );
      });
    });

    cy.then(() => {
      if (!skipped.length) return;

      cy.log(`Skipped ${skipped.length} non-2xx route(s)`);
      // eslint-disable-next-line no-console
      console.table(skipped);
    });
  });
});
