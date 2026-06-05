import assert from "node:assert/strict";
import { test } from "node:test";
import { main } from "../dist/cli.js";

function createOutput() {
  const stdout = [];
  const stderr = [];

  return {
    io: {
      stdout(message) {
        stdout.push(message);
      },
      stderr(message) {
        stderr.push(message);
      }
    },
    stdout,
    stderr
  };
}

test("shows CLI help", async () => {
  const output = createOutput();
  const code = await main(["node", "gridwork", "--help"], output.io);

  assert.equal(code, 0);
  assert.match(output.stdout.join("\n"), /gridwork init/);
  assert.equal(output.stderr.length, 0);
});

test("recognizes init help", async () => {
  const output = createOutput();
  const code = await main(["node", "gridwork", "init", "--help"], output.io);

  assert.equal(code, 0);
  assert.match(output.stdout.join("\n"), /gridwork init/);
  assert.equal(output.stderr.length, 0);
});

test("does not expose a run command", async () => {
  const output = createOutput();
  const code = await main(["node", "gridwork", "run"], output.io);

  assert.equal(code, 2);
  assert.match(output.stderr.join("\n"), /Unknown command: run/);
  assert.doesNotMatch(output.stdout.join("\n"), /gridwork run/);
});
