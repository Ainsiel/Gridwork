import { resolve } from "node:path";
import type { CliIO } from "../cli.js";
import { EXIT_CODES } from "../init/constants.js";
import {
  formatFactoryReleaseDryRunResult,
  prepareFactoryReleaseDryRun
} from "../release/factory-release.js";
import {
  formatCliReleaseDryRunResult,
  prepareCliReleaseDryRun
} from "../release/cli-release.js";
import { isValidFactoryVersion } from "../init/remote-init.js";

export function getReleaseHelp(): string {
  return [
    "gridwork release",
    "",
    "Usage:",
    "  gridwork release factory --dry-run --factory-version <version> --source <owner/repo> [options]",
    "  gridwork release cli --dry-run --source <owner/repo> [options]",
    "",
    "Options:",
    "  -h, --help                    Show help",
    "  --dry-run                     Prepare artifacts and publish plan without publishing",
    "  --factory-version <version>   Factory SemVer version",
    "  --source <owner/repo>         GitHub repository for the factory release",
    "  --factory-dir <path>          Factory source directory (default: factory/.gridwork)",
    "  --source-commit <sha>         Source commit to record in manifest",
    "  --confirm-package-ownership   Record package ownership confirmation for CLI dry-run",
    "  --confirm-official-source     Record official factory source confirmation for CLI dry-run",
    "  --allow-prerelease            Allow prerelease factory versions",
    "",
    "Remote commands are never executed by this command."
  ].join("\n");
}

export async function runRelease(args: string[], io: CliIO): Promise<number> {
  if (args.includes("--help") || args.includes("-h")) {
    io.stdout(getReleaseHelp());
    return EXIT_CODES.success;
  }

  const subcommand = args[0];

  if (subcommand !== "factory" && subcommand !== "cli") {
    io.stderr(subcommand ? `Unknown release target: ${subcommand}` : "Missing release target.");
    io.stderr("");
    io.stderr(getReleaseHelp());
    return EXIT_CODES.usageError;
  }

  if (subcommand === "cli") {
    const parsed = parseCliReleaseArgs(args.slice(1));

    if (!parsed.ok) {
      io.stderr(parsed.message);
      io.stderr("");
      io.stderr(getReleaseHelp());
      return parsed.code;
    }

    const result = await prepareCliReleaseDryRun({
      targetDir: process.cwd(),
      source: parsed.source,
      sourceCommit: parsed.sourceCommit,
      confirmPackageOwnership: parsed.confirmPackageOwnership,
      confirmOfficialSource: parsed.confirmOfficialSource,
      allowPrerelease: parsed.allowPrerelease
    });
    const output = formatCliReleaseDryRunResult(result);

    if (result.code === EXIT_CODES.success) {
      io.stdout(output);
    } else {
      io.stderr(output);
    }

    return result.code;
  }

  const parsed = parseFactoryReleaseArgs(args.slice(1));

  if (!parsed.ok) {
    io.stderr(parsed.message);
    io.stderr("");
    io.stderr(getReleaseHelp());
    return parsed.code;
  }

  const result = await prepareFactoryReleaseDryRun({
    targetDir: process.cwd(),
    factoryDir: parsed.factoryDir,
    version: parsed.factoryVersion,
    source: parsed.source,
    sourceCommit: parsed.sourceCommit,
    allowPrerelease: parsed.allowPrerelease
  });
  const output = formatFactoryReleaseDryRunResult(result);

  if (result.code === EXIT_CODES.success) {
    io.stdout(output);
  } else {
    io.stderr(output);
  }

  return result.code;
}

interface ParsedCliReleaseArgs {
  ok: true;
  source: string;
  sourceCommit: string | undefined;
  confirmPackageOwnership: boolean;
  confirmOfficialSource: boolean;
  allowPrerelease: boolean;
}

interface ParsedFactoryReleaseArgs {
  ok: true;
  factoryVersion: string;
  source: string;
  factoryDir: string;
  sourceCommit: string | undefined;
  allowPrerelease: boolean;
}

interface ParseError {
  ok: false;
  code: number;
  message: string;
}

function parseFactoryReleaseArgs(args: string[]): ParsedFactoryReleaseArgs | ParseError {
  const parsed: ParsedFactoryReleaseArgs = {
    ok: true,
    factoryVersion: "",
    source: "",
    factoryDir: "factory/.gridwork",
    sourceCommit: undefined,
    allowPrerelease: false
  };
  let dryRun = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (arg === "--allow-prerelease") {
      parsed.allowPrerelease = true;
      continue;
    }

    if (arg === "--factory-version") {
      const value = args[index + 1];

      if (!value || value.startsWith("--")) {
        return usage("--factory-version requires a version value.");
      }

      if (!isValidFactoryVersion(value)) {
        return usage(`Invalid factory version: ${value}`);
      }

      parsed.factoryVersion = value;
      index += 1;
      continue;
    }

    if (arg === "--source") {
      const value = args[index + 1];

      if (!value || value.startsWith("--")) {
        return usage("--source requires an owner/repo value.");
      }

      if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value)) {
        return usage(`Invalid source: ${value}. Expected owner/repo.`);
      }

      parsed.source = value;
      index += 1;
      continue;
    }

    if (arg === "--factory-dir") {
      const value = args[index + 1];

      if (!value || value.startsWith("--")) {
        return usage("--factory-dir requires a path value.");
      }

      parsed.factoryDir = resolve(value);
      index += 1;
      continue;
    }

    if (arg === "--source-commit") {
      const value = args[index + 1];

      if (!value || value.startsWith("--")) {
        return usage("--source-commit requires a commit value.");
      }

      if (!/^[A-Za-z0-9_.-]+$/.test(value)) {
        return usage("--source-commit contains unsupported characters.");
      }

      parsed.sourceCommit = value;
      index += 1;
      continue;
    }

    return usage(`Unknown release option: ${arg}`);
  }

  if (!dryRun) {
    return usage("Only --dry-run is supported for factory release publishing in v1.");
  }

  if (!parsed.factoryVersion) {
    return usage("--factory-version is required.");
  }

  if (!parsed.source) {
    return usage("--source is required.");
  }

  if (parsed.factoryVersion.includes("-") && !parsed.allowPrerelease) {
    return usage("Prerelease factory versions require --allow-prerelease.");
  }

  return parsed;
}

function parseCliReleaseArgs(args: string[]): ParsedCliReleaseArgs | ParseError {
  const parsed: ParsedCliReleaseArgs = {
    ok: true,
    source: "",
    sourceCommit: undefined,
    confirmPackageOwnership: false,
    confirmOfficialSource: false,
    allowPrerelease: false
  };
  let dryRun = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (arg === "--confirm-package-ownership") {
      parsed.confirmPackageOwnership = true;
      continue;
    }

    if (arg === "--confirm-official-source") {
      parsed.confirmOfficialSource = true;
      continue;
    }

    if (arg === "--allow-prerelease") {
      parsed.allowPrerelease = true;
      continue;
    }

    if (arg === "--source") {
      const value = args[index + 1];

      if (!value || value.startsWith("--")) {
        return usage("--source requires an owner/repo value.");
      }

      if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value)) {
        return usage(`Invalid source: ${value}. Expected owner/repo.`);
      }

      parsed.source = value;
      index += 1;
      continue;
    }

    if (arg === "--source-commit") {
      const value = args[index + 1];

      if (!value || value.startsWith("--")) {
        return usage("--source-commit requires a commit value.");
      }

      if (!/^[A-Za-z0-9_.-]+$/.test(value)) {
        return usage("--source-commit contains unsupported characters.");
      }

      parsed.sourceCommit = value;
      index += 1;
      continue;
    }

    return usage(`Unknown release option: ${arg}`);
  }

  if (!dryRun) {
    return usage("Only --dry-run is supported for CLI release publishing in v1.");
  }

  if (!parsed.source) {
    return usage("--source is required.");
  }

  return parsed;
}

function usage(message: string): ParseError {
  return {
    ok: false,
    code: EXIT_CODES.usageError,
    message
  };
}
