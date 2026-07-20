import { parseOutput } from "../helpers/parse.js";
import { compileProject, runBinary } from "../helpers/compile.js";
import { PROJECT_DIR } from "../helpers/project-dir.js";

interface Scenario {
  args: number[];
  should_die: boolean;
  die_within_ms?: number;
  description: string;
}

export interface DeathTimingInput {
  scenarios?: Array<{
    args: number[];
    should_die: boolean;
    die_within_ms?: number;
  }>;
}

const DEFAULT_SCENARIOS: Scenario[] = [
  {
    args: [1, 800, 200, 200],
    should_die: true,
    die_within_ms: 810,
    description: "1 philosopher, only 1 fork -> must die",
  },
  {
    args: [4, 310, 200, 100],
    should_die: true,
    die_within_ms: 320,
    description: "4 philos, tight timing -> must die",
  },
  {
    args: [4, 410, 200, 200],
    should_die: false,
    description: "4 philos, balanced timing -> must NOT die",
  },
  {
    args: [5, 800, 200, 200],
    should_die: false,
    description: "5 philos, comfortable timing -> must NOT die",
  },
  {
    args: [2, 410, 200, 200],
    should_die: false,
    description: "2 philos, just enough time -> must NOT die",
  },
  {
    args: [3, 310, 200, 100],
    should_die: true,
    die_within_ms: 320,
    description: "3 odd philos, tight -> must die",
  },
];

export function deathTimingTest(input: DeathTimingInput): string {
  const compile = compileProject(PROJECT_DIR);
  if (!compile.success) {
    return `## Compilation Failed\n\n\`\`\`\n${compile.error}\n\`\`\``;
  }

  const scenarios: Scenario[] = input.scenarios
    ? input.scenarios.map((s, i) => ({
        ...s,
        description: `Custom scenario ${i + 1}: ${s.args.join(" ")}`,
      }))
    : DEFAULT_SCENARIOS;

  let report = `## Death Timing Test\n\n`;
  report += `| # | Scenario | Expected | Actual | Timing | Result |\n`;
  report += `|---|----------|----------|--------|--------|--------|\n`;

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < scenarios.length; i++) {
    const s = scenarios[i];
    const args = s.args.map(String);

    // For "should NOT die" scenarios, run for a few seconds
    const timeout = s.should_die ? 15000 : 8000;
    const result = runBinary(PROJECT_DIR, args, timeout);
    const output = result.output || "";
    const actions = parseOutput(output);
    const deathAction = actions.find(a => a.action === "died");

    let actual: string;
    let timing: string;
    let pass: boolean;

    if (s.should_die) {
      if (deathAction) {
        actual = "DIED";
        timing = `${deathAction.timestamp}ms`;
        if (s.die_within_ms) {
          pass = deathAction.timestamp <= s.die_within_ms;
          if (!pass) {
            timing += ` (expected <${s.die_within_ms}ms)`;
          }
        } else {
          pass = true;
        }
      } else {
        actual = "SURVIVED";
        timing = "N/A";
        pass = false;
      }
    } else {
      // Should NOT die — run long enough and check
      if (deathAction) {
        actual = `DIED@${deathAction.timestamp}ms`;
        timing = `${deathAction.timestamp}ms`;
        pass = false;
      } else {
        actual = "SURVIVED";
        timing = "OK";
        pass = true;
      }
    }

    const expected = s.should_die ? "MUST DIE" : "MUST SURVIVE";
    const resultEmoji = pass ? "✅" : "❌";

    report += `| ${i + 1} | ${s.description} | ${expected} | ${actual} | ${timing} | ${resultEmoji} |\n`;

    if (pass) passed++;
    else failed++;
  }

  report += `\n**Summary**: ${passed}/${scenarios.length} passed`;
  if (failed > 0) {
    report += ` (${failed} failed)`;
  }
  report += `\n`;

  return report;
}
