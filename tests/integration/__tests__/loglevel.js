"use strict";

const stripAnsi = require("strip-ansi");
const runPrettier = require("../run-prettier.js");

test("do not show logs with --loglevel silent", async () => {
  await runPrettierWithLogLevel("silent", null);
});

test("do not show warnings with --loglevel error", async () => {
  await runPrettierWithLogLevel("error", ["[error]"]);
});

test("show errors and warnings with --loglevel warn", async () => {
  await runPrettierWithLogLevel("warn", ["[error]", "[warn]"]);
});

test("show all logs with --loglevel debug", async () => {
  await runPrettierWithLogLevel("debug", ["[error]", "[warn]", "[debug]"]);
});

describe("--write with --loglevel=silent doesn't log filenames", () => {
  runPrettier("cli/write", [
    "--write",
    "unformatted.js",
    "--loglevel=silent",
  ]).test({
    status: 0,
  });
});

describe("Should use default level logger to log `--loglevel` error", () => {
  runPrettier("cli/loglevel", ["--loglevel", "a-unknown-log-level"]).test({
    status: "non-zero",
    write: [],
    stdout: "",
  });
});

async function runPrettierWithLogLevel(logLevel, patterns) {
  const result = await runPrettier("cli/loglevel", [
    "--loglevel",
    logLevel,
    "--unknown-option",
    "--parser",
    "unknown-parser",
    "not-found.js",
  ]);

  expect(result.status).toBe(2);

  const stderr = stripAnsi(result.stderr);

  if (patterns) {
    for (const pattern of patterns) {
      expect(stderr).toMatch(pattern);
    }
  } else {
    expect(stderr).toMatch(/^\s*$/);
  }
}
