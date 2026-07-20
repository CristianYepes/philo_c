import { parseOutput, computeStats } from "../helpers/parse.js";
import { compileProject, runBinary } from "../helpers/compile.js";

const PROJECT_DIR = "/home/cristian/Desktop/philo_c";

export interface StarvationInput {
  num_philos: number;
  time_to_die: number;
  time_to_eat: number;
  time_to_sleep: number;
  duration_ms: number;
}

export function starvationAnalysis(input: StarvationInput): string {
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

  const timeout = input.duration_ms + 5000;
  const result = runBinary(PROJECT_DIR, args, timeout);
  const output = result.output || "";
  const actions = parseOutput(output);

  if (actions.length === 0) {
    return `## Starvation Analysis\n\n❌ No output produced.`;
  }

  const death = actions.find(a => a.action === "died");
  if (death) {
    return `## Starvation Analysis\n\n⚠️ **Philosopher ${death.id} died at ${death.timestamp}ms** — cannot perform starvation analysis on a failed simulation.\n\nUse \`death_timing_test\` to diagnose the death first.`;
  }

  const stats = computeStats(actions, input.num_philos);
  const mealCounts = stats.map(s => s.mealCount);
  const avgMeals = mealCounts.reduce((a, b) => a + b, 0) / mealCounts.length;
  const minMeals = Math.min(...mealCounts);
  const maxMeals = Math.max(...mealCounts);
  const fairnessRatio = minMeals / maxMeals;

  let report = `## Starvation Analysis\n\n`;
  report += `**Parameters**: \`${args.join(" ")}\`\n`;
  report += `**Duration**: ~${actions[actions.length - 1].timestamp}ms\n`;
  report += `**Fairness ratio**: ${(fairnessRatio * 100).toFixed(1)}% (min/max meals)\n\n`;

  // Fairness evaluation
  if (fairnessRatio >= 0.8) {
    report += `✅ **FAIR** — All philosophers eating at a similar rate.\n\n`;
  } else if (fairnessRatio >= 0.5) {
    report += `⚠️ **UNEVEN** — Some philosophers eating significantly less.\n\n`;
  } else {
    report += `❌ **STARVATION DETECTED** — Severe meal imbalance.\n\n`;
  }

  // Per-philosopher table
  report += `### Per-Philosopher Statistics\n\n`;
  report += `| Philo | Meals | Max Gap (ms) | Avg Gap (ms) | Status |\n`;
  report += `|-------|-------|-------------|-------------|--------|\n`;

  for (const s of stats) {
    const starving = s.mealCount < avgMeals * 0.6;
    const status = starving ? "⚠️ STARVING" : "✅ OK";
    report += `| ${s.id} | ${s.mealCount} | ${s.maxTimeBetweenMeals} | ${s.avgTimeBetweenMeals.toFixed(0)} | ${status} |\n`;
  }

  report += `\n### Summary\n\n`;
  report += `- **Average meals**: ${avgMeals.toFixed(1)}\n`;
  report += `- **Min meals**: ${minMeals} (Philo ${stats.find(s => s.mealCount === minMeals)?.id})\n`;
  report += `- **Max meals**: ${maxMeals} (Philo ${stats.find(s => s.mealCount === maxMeals)?.id})\n`;
  report += `- **Standard deviation**: ${standardDev(mealCounts).toFixed(2)}\n`;

  if (fairnessRatio < 0.8) {
    report += `\n### Recommendations\n\n`;
    report += `- Add a thinking delay for odd-numbered philosophers to stagger fork acquisition\n`;
    report += `- Ensure fork ordering prevents systematic starvation\n`;
    report += `- Consider adding a small usleep after eating to yield CPU\n`;
  }

  return report;
}

function standardDev(arr: number[]): number {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const squareDiffs = arr.map(v => (v - mean) ** 2);
  return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / arr.length);
}
