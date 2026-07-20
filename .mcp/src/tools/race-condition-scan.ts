import { execSync } from "child_process";
import { compileWithFlags, runBinaryWithStderr } from "../helpers/compile.js";
import { PROJECT_DIR } from "../helpers/project-dir.js";

export interface RaceScanInput {
  num_philos?: number;
  time_to_die?: number;
  time_to_eat?: number;
  time_to_sleep?: number;
  iterations?: number;
}

interface RaceReport {
  location: string;
  description: string;
  count: number;
  stacks: string[];
}

function parseTsanOutput(stderr: string): RaceReport[] {
  const races: Map<string, RaceReport> = new Map();
  const blocks = stderr.split("==================");

  for (const block of blocks) {
    if (!block.includes("data race") && !block.includes("ThreadSanitizer")) continue;

    const lines = block.split("\n");
    let description = "";
    let location = "";
    const stackLines: string[] = [];

    for (const line of lines) {
      if (line.includes("WARNING: ThreadSanitizer: data race")) {
        description = "data race";
      }
      if (line.includes("Read of size") || line.includes("Write of size")) {
        description = line.trim();
      }
      const srcMatch = line.match(/([\w.]+\.c):(\d+)/);
      if (srcMatch && !location) {
        location = `${srcMatch[1]}:${srcMatch[2]}`;
      }
      if (line.includes("#")) {
        stackLines.push(line.trim());
      }
    }

    if (location && description) {
      const key = `${location}:${description}`;
      const existing = races.get(key);
      if (existing) {
        existing.count++;
      } else {
        races.set(key, {
          location,
          description,
          count: 1,
          stacks: stackLines.slice(0, 6),
        });
      }
    }
  }

  return Array.from(races.values());
}

export function raceConditionScan(input: RaceScanInput): string {
  const numPhilos = input.num_philos || 4;
  const timeToDie = input.time_to_die || 410;
  const timeToEat = input.time_to_eat || 200;
  const timeToSleep = input.time_to_sleep || 200;
  const iterations = input.iterations || 5;

  const compile = compileWithFlags(PROJECT_DIR, ["-fsanitize=thread", "-g"]);
  if (!compile.success) {
    // TSan might not be available
    if (compile.error?.includes("fsanitize=thread")) {
      return `## ThreadSanitizer Not Available\n\nYour compiler does not support \`-fsanitize=thread\`. Install GCC or Clang with TSan support.\n\n\`\`\`\n${compile.error}\n\`\`\``;
    }
    return `## Compilation Failed\n\n\`\`\`\n${compile.error}\n\`\`\``;
  }

  const args = [
    String(numPhilos),
    String(timeToDie),
    String(timeToEat),
    String(timeToSleep),
    "3", // few meals to keep it short
  ];

  const allRaces: RaceReport[] = [];

  for (let i = 0; i < iterations; i++) {
    const result = runBinaryWithStderr(PROJECT_DIR, args, 15000);
    const found = parseTsanOutput(result.stderr);
    for (const race of found) {
      const existing = allRaces.find(r => r.location === race.location && r.description === race.description);
      if (existing) {
        existing.count += race.count;
      } else {
        allRaces.push(race);
      }
    }
  }

  // Recompile without sanitizer
  execSync("make fclean && make", { cwd: PROJECT_DIR, timeout: 10000, stdio: "pipe" });

  let report = `## Race Condition Scan\n\n`;
  report += `**Parameters**: ${args.join(" ")}\n`;
  report += `**Iterations**: ${iterations}\n`;
  report += `**Result**: ${allRaces.length === 0 ? "✅ NO RACES DETECTED" : `❌ ${allRaces.length} UNIQUE RACE(S) FOUND`}\n\n`;

  if (allRaces.length > 0) {
    report += `### Data Races\n\n`;
    for (const race of allRaces) {
      report += `#### ${race.location}\n`;
      report += `- **What**: ${race.description}\n`;
      report += `- **Occurrences**: ${race.count} across ${iterations} runs\n`;
      if (race.stacks.length > 0) {
        report += `- **Stack**:\n\`\`\`\n${race.stacks.join("\n")}\n\`\`\`\n`;
      }
      report += `\n`;
    }

    report += `### Common Fixes\n\n`;
    report += `- Protect shared variables with mutex lock/unlock\n`;
    report += `- Ensure \`last_meal_time\` is always read/written under \`meal_lock\`\n`;
    report += `- Ensure \`sim_stop\` is always accessed under \`stop_lock\`\n`;
  }

  return report;
}
