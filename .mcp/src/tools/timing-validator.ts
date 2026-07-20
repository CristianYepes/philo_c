import { execSync } from "child_process";
import { parseOutput, computeStats, PhiloAction } from "../helpers/parse.js";
import { compileProject, runBinary } from "../helpers/compile.js";

const PROJECT_DIR = "/home/cristian/Desktop/philo_c";

export interface TimingValidatorInput {
  num_philos: number;
  time_to_die: number;
  time_to_eat: number;
  time_to_sleep: number;
  num_meals?: number;
  runs?: number;
}

export interface TimingIssue {
  run: number;
  philosopher: number;
  issue: string;
  timestamp: number;
  detail: string;
}

export function timingValidator(input: TimingValidatorInput): string {
  const runs = input.runs || 3;
  const allIssues: TimingIssue[] = [];
  let allPassed = true;

  const compile = compileProject(PROJECT_DIR);
  if (!compile.success) {
    return `## Compilation Failed\n\n\`\`\`\n${compile.error}\n\`\`\``;
  }

  const args = [
    String(input.num_philos),
    String(input.time_to_die),
    String(input.time_to_eat),
    String(input.time_to_sleep),
  ];
  if (input.num_meals !== undefined) {
    args.push(String(input.num_meals));
  }

  const timeout = input.num_meals
    ? Math.max(15000, input.num_meals * input.time_to_eat * 2)
    : 15000;

  for (let run = 1; run <= runs; run++) {
    const result = runBinary(PROJECT_DIR, args, timeout);
    const output = result.output || "";
    const actions = parseOutput(output);

    if (actions.length === 0) {
      allIssues.push({
        run,
        philosopher: 0,
        issue: "NO_OUTPUT",
        timestamp: 0,
        detail: "No valid output lines produced",
      });
      allPassed = false;
      continue;
    }

    // Check timestamps are monotonic
    let prevTs = -1;
    for (const a of actions) {
      if (a.timestamp < prevTs) {
        allIssues.push({
          run,
          philosopher: a.id,
          issue: "NON_MONOTONIC",
          timestamp: a.timestamp,
          detail: `Timestamp ${a.timestamp} < previous ${prevTs}`,
        });
        allPassed = false;
      }
      prevTs = a.timestamp;
    }

    // Check philosopher IDs are valid
    for (const a of actions) {
      if (a.id < 1 || a.id > input.num_philos) {
        allIssues.push({
          run,
          philosopher: a.id,
          issue: "INVALID_ID",
          timestamp: a.timestamp,
          detail: `Philosopher ID ${a.id} out of range [1, ${input.num_philos}]`,
        });
        allPassed = false;
      }
    }

    // Check death timing: no philosopher should die prematurely
    const stats = computeStats(actions, input.num_philos);
    for (const s of stats) {
      if (s.maxTimeBetweenMeals > input.time_to_die + 10) {
        allIssues.push({
          run,
          philosopher: s.id,
          issue: "LATE_DEATH_DETECTION",
          timestamp: s.deathTimestamp || 0,
          detail: `Max gap between meals: ${s.maxTimeBetweenMeals}ms (time_to_die: ${input.time_to_die}ms, tolerance: 10ms)`,
        });
        allPassed = false;
      }
    }

    // Check no output after death
    const deathIdx = actions.findIndex(a => a.action === "died");
    if (deathIdx !== -1 && deathIdx < actions.length - 1) {
      allIssues.push({
        run,
        philosopher: actions[deathIdx].id,
        issue: "OUTPUT_AFTER_DEATH",
        timestamp: actions[deathIdx].timestamp,
        detail: `${actions.length - deathIdx - 1} lines after death message`,
      });
      allPassed = false;
    }

    // Verify death validity (if death occurred)
    if (deathIdx !== -1) {
      const deadPhilo = actions[deathIdx].id;
      const deathTs = actions[deathIdx].timestamp;
      const lastMeal = actions
        .filter(a => a.id === deadPhilo && a.action === "is eating" && a.timestamp < deathTs)
        .pop();
      const lastMealTs = lastMeal ? lastMeal.timestamp : 0;
      const timeSinceMeal = deathTs - lastMealTs;

      if (timeSinceMeal < input.time_to_die) {
        allIssues.push({
          run,
          philosopher: deadPhilo,
          issue: "PREMATURE_DEATH",
          timestamp: deathTs,
          detail: `Died after ${timeSinceMeal}ms since last meal, but time_to_die is ${input.time_to_die}ms`,
        });
        allPassed = false;
      }
    }
  }

  // Format report
  let report = `## Timing Validation Report\n\n`;
  report += `**Parameters**: ${args.join(" ")}\n`;
  report += `**Runs**: ${runs}\n`;
  report += `**Result**: ${allPassed ? "✅ ALL PASSED" : "❌ ISSUES FOUND"}\n\n`;

  if (allIssues.length > 0) {
    report += `### Issues Found\n\n`;
    report += `| Run | Philo | Issue | Timestamp | Detail |\n`;
    report += `|-----|-------|-------|-----------|--------|\n`;
    for (const issue of allIssues) {
      report += `| ${issue.run} | ${issue.philosopher} | ${issue.issue} | ${issue.timestamp}ms | ${issue.detail} |\n`;
    }
  }

  return report;
}
