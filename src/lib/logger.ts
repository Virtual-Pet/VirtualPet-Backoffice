type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

function resolveLevel(): LogLevel {
  const envLevel = (
    process.env.NEXT_PUBLIC_LOG_LEVEL ?? process.env.LOG_LEVEL
  )?.toLowerCase() as LogLevel | undefined;
  if (envLevel && envLevel in LEVEL_ORDER) return envLevel;
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

const currentLevel = resolveLevel();
const threshold = LEVEL_ORDER[currentLevel];

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= threshold;
}

function format(level: LogLevel, module: string, message: string): string {
  const ts = new Date().toISOString();
  return `[${ts}] [${level.toUpperCase()}] [${module}] ${message}`;
}

export interface Logger {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}

export function createLogger(module: string): Logger {
  return {
    debug: (message, ...args) => {
      if (shouldLog("debug")) console.debug(format("debug", module, message), ...args);
    },
    info: (message, ...args) => {
      if (shouldLog("info")) console.info(format("info", module, message), ...args);
    },
    warn: (message, ...args) => {
      if (shouldLog("warn")) console.warn(format("warn", module, message), ...args);
    },
    error: (message, ...args) => {
      if (shouldLog("error")) console.error(format("error", module, message), ...args);
    },
  };
}

export const logger = createLogger("app");
