// Runs all tests and writes a dated report to reports/commits/.
// Used by the pre-commit hook. It never blocks a commit: in TDD a
// commit with failing tests (the "red" step) is normal, and the
// report documents it.
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { runTests, toMarkdown, reportFileName } = require("../src/testrunner");

(async () => {
  try {
    const summary = await runTests();

    let branch = "";
    try {
      branch = execSync("git branch --show-current").toString().trim();
    } catch (err) {
      // not inside a git repository, the branch is optional
    }

    const dir = path.join(__dirname, "..", "reports", "commits");
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, reportFileName(summary.date));
    fs.writeFileSync(file, toMarkdown(summary, { branch }));

    console.log(`Testrapport: ${summary.passed}/${summary.total} geslaagd, opgeslagen in ${path.relative(process.cwd(), file)}`);
  } catch (err) {
    console.warn("Testrapport niet gemaakt:", err.message);
  }
  process.exit(0);
})();
