#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { timingValidator } from "./tools/timing-validator.js";
import { raceConditionScan } from "./tools/race-condition-scan.js";
import { deathTimingTest } from "./tools/death-timing-test.js";
import { outputFormatValidator } from "./tools/output-format-validator.js";
import { starvationAnalysis } from "./tools/starvation-analysis.js";

const server = new McpServer({
  name: "philosophers-tools",
  version: "1.0.0",
});

server.tool(
  "timing_validator",
  "Run the philosophers simulation multiple times and validate: timestamps are monotonic, death is detected within 10ms of deadline, no premature deaths, no output after death, valid philosopher IDs.",
  {
    num_philos: z.number().int().min(1).describe("Number of philosophers"),
    time_to_die: z.number().int().min(1).describe("Time to die in milliseconds"),
    time_to_eat: z.number().int().min(1).describe("Time to eat in milliseconds"),
    time_to_sleep: z.number().int().min(1).describe("Time to sleep in milliseconds"),
    num_meals: z.number().int().min(1).optional().describe("Number of meals (optional)"),
    runs: z.number().int().min(1).max(20).optional().describe("Number of test runs (default: 3)"),
  },
  async (params) => {
    const result = timingValidator(params);
    return { content: [{ type: "text", text: result }] };
  }
);

server.tool(
  "race_condition_scan",
  "Compile with ThreadSanitizer (-fsanitize=thread), run multiple times, parse and deduplicate data races, report with project-specific context. Automatically recompiles normally afterwards.",
  {
    num_philos: z.number().int().min(1).optional().describe("Number of philosophers (default: 4)"),
    time_to_die: z.number().int().min(1).optional().describe("Time to die (default: 410)"),
    time_to_eat: z.number().int().min(1).optional().describe("Time to eat (default: 200)"),
    time_to_sleep: z.number().int().min(1).optional().describe("Time to sleep (default: 200)"),
    iterations: z.number().int().min(1).max(20).optional().describe("Number of iterations (default: 5)"),
  },
  async (params) => {
    const result = raceConditionScan(params);
    return { content: [{ type: "text", text: result }] };
  }
);

server.tool(
  "death_timing_test",
  "Run evaluator-standard scenarios that test death detection: 1-philosopher (must die with 1 fork), tight timings (must die), balanced timings (must survive). Reports PASS/FAIL with timing precision.",
  {
    scenarios: z
      .array(
        z.object({
          args: z.array(z.number().int()),
          should_die: z.boolean(),
          die_within_ms: z.number().int().optional(),
        })
      )
      .optional()
      .describe("Custom scenarios (uses 6 default evaluator scenarios if omitted)"),
  },
  async (params) => {
    const result = deathTimingTest(params);
    return { content: [{ type: "text", text: result }] };
  }
);

server.tool(
  "output_format_validator",
  "Verify every output line matches format '{timestamp} {id} {action}', check no interleaved/garbled lines, timestamps never decrease, IDs in range, no output after death, and correct fork-before-eat sequencing.",
  {
    num_philos: z.number().int().min(1).describe("Number of philosophers"),
    time_to_die: z.number().int().min(1).describe("Time to die in milliseconds"),
    time_to_eat: z.number().int().min(1).describe("Time to eat in milliseconds"),
    time_to_sleep: z.number().int().min(1).describe("Time to sleep in milliseconds"),
    num_meals: z.number().int().min(1).optional().describe("Number of meals (optional)"),
    duration_ms: z.number().int().optional().describe("Max run duration in ms (default: 10000)"),
  },
  async (params) => {
    const result = outputFormatValidator(params);
    return { content: [{ type: "text", text: result }] };
  }
);

server.tool(
  "starvation_analysis",
  "Run philosophers for an extended duration, compute per-philosopher meal counts, report fairness ratio and identify systematic starvation. Useful for testing with odd philosopher counts.",
  {
    num_philos: z.number().int().min(1).describe("Number of philosophers"),
    time_to_die: z.number().int().min(1).describe("Time to die in milliseconds"),
    time_to_eat: z.number().int().min(1).describe("Time to eat in milliseconds"),
    time_to_sleep: z.number().int().min(1).describe("Time to sleep in milliseconds"),
    duration_ms: z.number().int().min(1000).describe("How long to run the simulation in ms (e.g. 30000 for 30s)"),
  },
  async (params) => {
    const result = starvationAnalysis(params);
    return { content: [{ type: "text", text: result }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
