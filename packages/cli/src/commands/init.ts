import type { CliIO } from "../cli.js";
import { EXIT_CODES } from "../init/constants.js";
import { formatConsoleResult, runLocalInit } from "../init/local-init.js";
import { isValidFactoryVersion, runRemoteInit } from "../init/remote-init.js";

export function getInitHelp(): string {
  return [
    "gridwork init",
    "",
    "Usage:",
    "  gridwork init [options]",
    "",
    "Options:",
    "  -h, --help  Show help",
    "  --verbose   Print safe diagnostic details",
    "  --factory-version <version>  Install a released factory bundle",
    "  --source <owner/repo>        GitHub repository for the factory bundle",
    "  --allow-prerelease          Allow prerelease factory bundles",
    "",
    "Default:",
    "  Installs the local minimal Gridwork factory into the current repository.",
    "",
    "Released bundles:",
    "  gridwork init --factory-version 0.1.0 --source owner/repo"
  ].join("\n");
}

export async function runInit(args: string[], io: CliIO): Promise<number> {
  if (args.includes("--help") || args.includes("-h")) {
    io.stdout(getInitHelp());
    return EXIT_CODES.success;
  }

  const unsupportedFlag = args.find((arg) => arg === "--json" || arg === "--silent" || arg === "--force");

  if (unsupportedFlag) {
    io.stderr(`Unsupported init option: ${unsupportedFlag}`);
    io.stderr("");
    io.stderr(getInitHelp());
    return EXIT_CODES.usageError;
  }

  const parsed = parseInitArgs(args);

  if (!parsed.ok) {
    io.stderr(parsed.message);
    io.stderr("");
    io.stderr(getInitHelp());
    return parsed.code;
  }

  const result = parsed.factoryVersion
    ? await runRemoteInit({
        targetDir: process.cwd(),
        verbose: parsed.verbose,
        factoryVersion: parsed.factoryVersion,
        source: parsed.source,
        allowPrerelease: parsed.allowPrerelease
      })
    : await runLocalInit({
        targetDir: process.cwd(),
        verbose: parsed.verbose
      });

  const output = formatConsoleResult(result, parsed.verbose);

  if (result.code === EXIT_CODES.success) {
    io.stdout(output);
  } else {
    io.stderr(output);
  }

  return result.code;
}

interface ParsedInitArgs {
  ok: true;
  verbose: boolean;
  factoryVersion: string | null;
  source: string | undefined;
  allowPrerelease: boolean;
}

interface ParseInitError {
  ok: false;
  code: number;
  message: string;
}

function parseInitArgs(args: string[]): ParsedInitArgs | ParseInitError {
  const parsed: ParsedInitArgs = {
    ok: true,
    verbose: false,
    factoryVersion: null,
    source: undefined,
    allowPrerelease: false
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--verbose") {
      parsed.verbose = true;
      continue;
    }

    if (arg === "--allow-prerelease") {
      parsed.allowPrerelease = true;
      continue;
    }

    if (arg === "--factory-version") {
      const value = args[index + 1];

      if (!value || value.startsWith("--")) {
        return {
          ok: false,
          code: EXIT_CODES.usageError,
          message: "--factory-version requires a version value."
        };
      }

      if (!isValidFactoryVersion(value)) {
        return {
          ok: false,
          code: EXIT_CODES.usageError,
          message: `Invalid factory version: ${value}`
        };
      }

      parsed.factoryVersion = value;
      index += 1;
      continue;
    }

    if (arg === "--source") {
      const value = args[index + 1];

      if (!value || value.startsWith("--")) {
        return {
          ok: false,
          code: EXIT_CODES.usageError,
          message: "--source requires an owner/repo value."
        };
      }

      if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value)) {
        return {
          ok: false,
          code: EXIT_CODES.usageError,
          message: `Invalid source: ${value}. Expected owner/repo.`
        };
      }

      parsed.source = value;
      index += 1;
      continue;
    }

    return {
      ok: false,
      code: EXIT_CODES.usageError,
      message: `Unknown init option: ${arg}`
    };
  }

  if (parsed.source && !parsed.factoryVersion) {
    return {
      ok: false,
      code: EXIT_CODES.usageError,
      message: "--source requires --factory-version."
    };
  }

  if (parsed.allowPrerelease && !parsed.factoryVersion) {
    return {
      ok: false,
      code: EXIT_CODES.usageError,
      message: "--allow-prerelease requires --factory-version."
    };
  }

  return parsed;
}
