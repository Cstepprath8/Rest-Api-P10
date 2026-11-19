const { summarize, toMarkdown, reportFileName } = require("../src/testrunner");

// A trimmed-down version of what `jest --json` returns
const jestResult = {
  startTime: 1000,
  testResults: [
    {
      name: "/project/tests/crypto.test.js", status: "passed", endTime: 1500,
      assertionResults: [
        { fullName: "GET /crypto returns a list of coins", status: "passed" },
        { fullName: "GET /crypto/:symbol returns 404", status: "failed" },
      ],
    },
    { name: "/project/tests/broken.test.js", status: "failed", endTime: 2000, assertionResults: [] },
  ],
};

describe("summarize", () => {
  it("counts passed and failed tests and keeps the file names", () => {
    const s = summarize(jestResult);
    expect(s.passed).toBe(1);
    expect(s.failed).toBe(2);
    expect(s.total).toBe(3);
    expect(s.durationMs).toBe(1000);
    expect(s.tests[0]).toEqual({
      suite: "crypto.test.js", name: "GET /crypto returns a list of coins", status: "passed",
    });
  });

  it("reports a test file that could not start as a failed test", () => {
    const s = summarize(jestResult);
    expect(s.tests[2].suite).toBe("broken.test.js");
    expect(s.tests[2].status).toBe("failed");
  });
});

describe("toMarkdown", () => {
  const summary = {
    date: new Date(2026, 10, 19, 14, 32, 5).toISOString(),
    passed: 1, failed: 1, total: 2, durationMs: 1500,
    tests: [
      { suite: "a.test.js", name: "works", status: "passed" },
      { suite: "a.test.js", name: "a | b", status: "failed" },
    ],
  };

  it("contains the date, the totals and a row per test", () => {
    const md = toMarkdown(summary, { branch: "main" });
    expect(md).toContain("19-11-2026 14:32:05");
    expect(md).toContain("1 geslaagd, 1 gefaald, 2 totaal");
    expect(md).toContain("main");
    expect(md).toContain("| ✅ | a.test.js | works |");
  });

  it("escapes pipe characters so the table stays intact", () => {
    expect(toMarkdown(summary)).toContain("a \\| b");
  });
});

describe("reportFileName", () => {
  it("puts the date and time in the file name", () => {
    const name = reportFileName(new Date(2026, 10, 19, 14, 32, 5).toISOString());
    expect(name).toBe("test-report-2026-11-19_14-32-05.md");
  });
});
