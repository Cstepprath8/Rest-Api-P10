const { spawn } = require("child_process");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TIMEOUT_MS = 120000;

// A run that is already in progress is reused, so requests cannot pile up
let running = null;

const pad = (n) => String(n).padStart(2, "0");

// Turn the output of `jest --json` into a small summary
function summarize(result) {
  const tests = [];
  let lastEnd = result.startTime;

  for (const suite of result.testResults) {
    const file = path.basename(suite.name);
    lastEnd = Math.max(lastEnd, suite.endTime || 0);
    for (const t of suite.assertionResults) {
      tests.push({ suite: file, name: t.fullName, status: t.status });
    }
    // A test file that cannot start has no individual results
    if (suite.assertionResults.length === 0 && suite.status === "failed") {
      tests.push({ suite: file, name: "(testbestand kon niet starten)", status: "failed" });
    }
  }

  const passed = tests.filter((t) => t.status === "passed").length;
  const failed = tests.filter((t) => t.status === "failed").length;
  return {
    date: new Date().toISOString(),
    passed,
    failed,
    total: tests.length,
    durationMs: lastEnd - result.startTime,
    tests,
  };
}

function formatDate(iso) {
  const d = new Date(iso);
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// File name with date and time, for example test-report-2026-11-19_14-32-05.md
function reportFileName(iso) {
  const d = new Date(iso);
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
  return `test-report-${date}_${time}.md`;
}

// Readable report for GitHub
function toMarkdown(summary, meta = {}) {
  const ok = summary.failed === 0;
  const lines = [
    "# Testrapport",
    "",
    `- **Datum:** ${formatDate(summary.date)}`,
  ];
  if (meta.branch) lines.push(`- **Branch:** ${meta.branch}`);
  lines.push(
    `- **Resultaat:** ${ok ? "✅ alle tests geslaagd" : "❌ er zijn tests gefaald"}`,
    `- **Aantal:** ${summary.passed} geslaagd, ${summary.failed} gefaald, ${summary.total} totaal`,
    `- **Duur:** ${(summary.durationMs / 1000).toFixed(1)} s`,
    "",
    "## Tests",
    "",
    "| Status | Testbestand | Test |",
    "|---|---|---|"
  );
  for (const t of summary.tests) {
    const icon = t.status === "passed" ? "✅" : "❌";
    lines.push(`| ${icon} | ${t.suite} | ${t.name.replace(/\|/g, "\\|")} |`);
  }
  lines.push("");
  return lines.join("\n");
}

// Run the whole Jest suite in a separate process and return the summary
function runTests() {
  if (running) return running;

  running = new Promise((resolve, reject) => {
    const jestBin = require.resolve("jest/bin/jest");
    const child = spawn(process.execPath, [jestBin, "--json", "--runInBand"], {
      cwd: ROOT,
      env: { ...process.env, NODE_ENV: "test" },
    });

    let out = "";
    child.stdout.on("data", (chunk) => (out += chunk));

    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("Test run timed out"));
    }, TIMEOUT_MS);

    child.on("error", reject);
    child.on("close", () => {
      clearTimeout(timer);
      try {
        resolve(summarize(JSON.parse(out)));
      } catch (err) {
        reject(new Error("Could not read the Jest output"));
      }
    });
  }).finally(() => {
    running = null;
  });

  return running;
}

module.exports = { runTests, summarize, toMarkdown, reportFileName };
