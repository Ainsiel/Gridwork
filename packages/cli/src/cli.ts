import { runInit } from "./commands/init.js";
import { runRelease } from "./commands/release.js";

export interface CliIO {
  stdout(message: string): void;
  stderr(message: string): void;
}

const defaultIo: CliIO = {
  stdout(message) {
    console.log(message);
  },
  stderr(message) {
    console.error(message);
  }
};

export function getCliHelp(): string {
  return [
    "Gridwork CLI",
    "",
  "Usage:",
  "  gridwork init [options]",
  "  gridwork release factory --dry-run [options]",
  "",
  "Commands:",
  "  init        Prepare a repository for a Gridwork factory",
  "  release     Prepare Gridwork factory release artifacts",
    "",
    "Options:",
    "  -h, --help  Show help"
  ].join("\n");
}

export async function main(argv: string[] = process.argv, io: CliIO = defaultIo): Promise<number> {
  const args = argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    io.stdout(getCliHelp());
    return 0;
  }

  if (command === "init") {
    return runInit(args.slice(1), io);
  }

  if (command === "release") {
    return runRelease(args.slice(1), io);
  }

  io.stderr(`Unknown command: ${command}`);
  io.stderr("");
  io.stderr(getCliHelp());
  return 2;
}
