export interface PhiloAction {
  timestamp: number;
  id: number;
  action: string;
  raw: string;
  lineNumber: number;
}

export function parseOutput(output: string): PhiloAction[] {
  const lines = output.trim().split("\n").filter(l => l.length > 0);
  const actions: PhiloAction[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = line.match(/^(\d+)\s+(\d+)\s+(.+)$/);
    if (match) {
      actions.push({
        timestamp: parseInt(match[1]),
        id: parseInt(match[2]),
        action: match[3],
        raw: line,
        lineNumber: i + 1,
      });
    }
  }
  return actions;
}

export interface PhiloStats {
  id: number;
  mealCount: number;
  lastMealTimestamp: number;
  maxTimeBetweenMeals: number;
  avgTimeBetweenMeals: number;
  died: boolean;
  deathTimestamp?: number;
}

export function computeStats(actions: PhiloAction[], numPhilos: number): PhiloStats[] {
  const stats: PhiloStats[] = [];

  for (let id = 1; id <= numPhilos; id++) {
    const philoActions = actions.filter(a => a.id === id);
    const meals = philoActions.filter(a => a.action === "is eating");
    const death = philoActions.find(a => a.action === "died");

    let maxGap = 0;
    let totalGap = 0;
    const mealTimes = [0, ...meals.map(m => m.timestamp)];
    for (let i = 1; i < mealTimes.length; i++) {
      const gap = mealTimes[i] - mealTimes[i - 1];
      maxGap = Math.max(maxGap, gap);
      totalGap += gap;
    }

    stats.push({
      id,
      mealCount: meals.length,
      lastMealTimestamp: mealTimes[mealTimes.length - 1],
      maxTimeBetweenMeals: maxGap,
      avgTimeBetweenMeals: mealTimes.length > 1 ? totalGap / (mealTimes.length - 1) : 0,
      died: !!death,
      deathTimestamp: death?.timestamp,
    });
  }

  return stats;
}

export function validateOutputFormat(output: string): {
  valid: boolean;
  errors: string[];
} {
  const lines = output.trim().split("\n").filter(l => l.length > 0);
  const errors: string[] = [];
  const validActions = [
    "is eating",
    "is sleeping",
    "is thinking",
    "died",
    "has taken a fork",
  ];

  let prevTimestamp = -1;
  let deathSeen = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = line.match(/^(\d+)\s+(\d+)\s+(.+)$/);

    if (!match) {
      errors.push(`Line ${i + 1}: malformed output: "${line}"`);
      continue;
    }

    const timestamp = parseInt(match[1]);
    const action = match[3];

    if (!validActions.includes(action)) {
      errors.push(`Line ${i + 1}: unknown action "${action}"`);
    }

    if (timestamp < prevTimestamp) {
      errors.push(`Line ${i + 1}: timestamp ${timestamp} < previous ${prevTimestamp} (non-monotonic)`);
    }
    prevTimestamp = timestamp;

    if (deathSeen) {
      errors.push(`Line ${i + 1}: output after death message`);
    }
    if (action === "died") {
      deathSeen = true;
    }
  }

  return { valid: errors.length === 0, errors };
}
