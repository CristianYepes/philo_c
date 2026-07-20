# Philosophers MCP Tools

Development tools for the philosophers project. Provides timing validation, race detection, and evaluator-standard testing.

## Tools

| Tool | Description |
|------|-------------|
| `timing_validator` | Validate timestamps, death detection timing, monotonicity, and output correctness across multiple runs |
| `race_condition_scan` | Compile with ThreadSanitizer, run N times, deduplicate and report data races with context |
| `death_timing_test` | Run evaluator scenarios (1-philo death, tight timings, balanced survival) with PASS/FAIL |
| `output_format_validator` | Verify output format, no interleaving, fork-before-eat sequencing, no output after death |
| `starvation_analysis` | Extended-run fairness analysis: per-philosopher meal distribution and starvation detection |

## Build

```bash
cd .mcp && npm install && npm run build
```

## Configuration

Add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "philosophers-tools": {
      "command": "node",
      "args": ["/home/cristian/Desktop/philo_c/.mcp/build/index.js"]
    }
  }
}
```
