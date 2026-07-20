import { parseOutput, validateOutputFormat } from "../helpers/parse.js";
import { compileProject, runBinary } from "../helpers/compile.js";

const PROJECT_DIR = "/home/cristian/Desktop/philo_c";

export interface OutputFormatInput {
  num_philos: number;
  time_to_die: number;
  time_to_eat: number;
  time_to_sleep: number;
  num_meals?: number;
  duration_ms?: number;
}

export function outputFormatValidator(input: OutputFormatInput): string {
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

  const timeout = input.duration_ms || 10000;
  const result = runBinary(PROJECT_DIR, args, timeout);
  const output = result.output || "";

  if (!output.trim()) {
    return `## Output Format Validation\n\n❌ **No output produced**\n\nThe program produced no stdout output with args: \`${args.join(" ")}\``;
  }

  const validation = validateOutputFormat(output);
  const actions = parseOutput(output);

  // Additional checks
  const additionalErrors: string[] = [];

  // Check all IDs are in valid range
  for (const a of actions) {
    if (a.id < 1 || a.id > input.num_philos) {
      additionalErrors.push(`Line ${a.lineNumber}: ID ${a.id} out of range [1, ${input.num_philos}]`);
    }
  }

  // Check for interleaved lines (incomplete lines mixed together)
  const lines = output.trim().split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("\r") || (line.length > 0 && !line.match(/^\d+\s+\d+\s+/))) {
      additionalErrors.push(`Line ${i + 1}: possible interleaved/garbled output: "${line.substring(0, 50)}"`);
    }
  }

  // Check eating sequence: must have 2 forks before eating
  const philoForkCount = new Map<number, number>();
  for (const a of actions) {
    if (a.action === "has taken a fork") {
      philoForkCount.set(a.id, (philoForkCount.get(a.id) || 0) + 1);
    } else if (a.action === "is eating") {
      const forks = philoForkCount.get(a.id) || 0;
      if (forks % 2 !== 0) {
        additionalErrors.push(
          `Line ${a.lineNumber}: philo ${a.id} eating without 2 forks (odd fork count: ${forks})`
        );
      }
    }
  }

  const allErrors = [...validation.errors, ...additionalErrors];

  let report = `## Output Format Validation\n\n`;
  report += `**Parameters**: \`${args.join(" ")}\`\n`;
  report += `**Lines parsed**: ${actions.length}\n`;
  report += `**Result**: ${allErrors.length === 0 ? "✅ ALL VALID" : `❌ ${allErrors.length} ERROR(S)`}\n\n`;

  if (allErrors.length > 0) {
    report += `### Errors\n\n`;
    for (const err of allErrors.slice(0, 20)) {
      report += `- ${err}\n`;
    }
    if (allErrors.length > 20) {
      report += `\n... and ${allErrors.length - 20} more errors\n`;
    }
  }

  // Stats summary
  report += `\n### Output Summary\n\n`;
  report += `- **Total lines**: ${lines.length}\n`;
  report += `- **Duration**: ${actions.length > 0 ? actions[actions.length - 1].timestamp : 0}ms\n`;
  report += `- **Death occurred**: ${actions.some(a => a.action === "died") ? "YES" : "NO"}\n`;

  const mealCounts = new Map<number, number>();
  for (const a of actions) {
    if (a.action === "is eating") {
      mealCounts.set(a.id, (mealCounts.get(a.id) || 0) + 1);
    }
  }
  report += `- **Meals per philosopher**: ${Array.from(mealCounts.entries()).map(([id, count]) => `P${id}:${count}`).join(", ")}\n`;

  return report;
}
