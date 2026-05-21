/**
 * Shared CLI help helpers for brand skill scripts.
 */

function wantsHelp(argv) {
  return argv.includes("--help") || argv.includes("-h");
}

function printHelpAndExit(usageLines) {
  console.log(usageLines.join("\n"));
  process.exit(0);
}

module.exports = { wantsHelp, printHelpAndExit };
