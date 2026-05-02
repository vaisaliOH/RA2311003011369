const LOG_ENDPOINT = "http://20.207.122.201/evaluation-service/logs";

const allowedStacks = new Set(["backend", "frontend"]);
const allowedLevels = new Set(["debug", "info", "warn", "error", "fatal"]);
const backendPackages = new Set([
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service"
]);
const frontendPackages = new Set(["api", "component", "hook", "page", "state", "style"]);
const sharedPackages = new Set(["auth", "config", "middleware", "utils"]);

function hasPackage(stack, packageName) {
  if (sharedPackages.has(packageName)) {
    return true;
  }
  return stack === "backend"
    ? backendPackages.has(packageName)
    : frontendPackages.has(packageName);
}

function requireValidPayload(stack, level, packageName, message) {
  if (!allowedStacks.has(stack)) {
    throw new Error(`invalid stack '${stack}'`);
  }
  if (!allowedLevels.has(level)) {
    throw new Error(`invalid level '${level}'`);
  }
  if (!hasPackage(stack, packageName)) {
    throw new Error(`invalid package '${packageName}' for ${stack}`);
  }
  if (typeof message !== "string" || message.trim().length === 0) {
    throw new Error("log message must be a non-empty string");
  }
}

async function Log(stack, level, packageName, message, options = {}) {
  const normalisedStack = String(stack).toLowerCase();
  const normalisedLevel = String(level).toLowerCase();
  const normalisedPackage = String(packageName).toLowerCase();
  const cleanMessage = String(message).slice(0, 500);

  requireValidPayload(normalisedStack, normalisedLevel, normalisedPackage, cleanMessage);

  const token = options.token || process.env.LOG_TOKEN || process.env.AUTH_TOKEN;
  if (!token) {
    return {
      skipped: true,
      reason: "missing LOG_TOKEN or AUTH_TOKEN"
    };
  }

  const response = await fetch(LOG_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      stack: normalisedStack,
      level: normalisedLevel,
      package: normalisedPackage,
      message: cleanMessage
    })
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = body.message || body.error || response.statusText;
    throw new Error(`log request failed with ${response.status}: ${detail}`);
  }

  return body;
}

module.exports = {
  Log
};

