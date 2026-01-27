import type { Result } from "axe-core";


export function logA11yViolations(violations: Result[]) {
  if (!violations?.length) return;

  
  console.log(`\nA11y violations: ${violations.length}\n`);

  violations.forEach((v) => {
    
    console.log(`\n[${v.impact ?? "impact?"}] ${v.id}: ${v.help}`);
    if (v.helpUrl) {
      
      console.log(`Help: ${v.helpUrl}`);
    }

    v.nodes.forEach((node, idx) => {
      const selector = node.target?.[0] || "(no selector)";
      
      console.log(`  Node ${idx + 1}: ${selector}`);
      if (node.failureSummary) {
        
        console.log(`  Failure: ${node.failureSummary}`);
      }
      
      console.log(`  HTML: ${node.html}\n`);
    });
  });
}
