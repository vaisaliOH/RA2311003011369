const apiBase = import.meta.env.VITE_API_BASE || "/evaluation-service";
const allowedLevels = new Set(["debug", "info", "warn", "error", "fatal"]);
const allowedPackages = new Set([
  "api",
  "component",
  "hook",
  "page",
  "state",
  "style",
  "auth",
  "config",
  "middleware",
  "utils"
]);

export async function logEvent(stack, level, packageName, message) {
  const token = import.meta.env.VITE_AUTH_TOKEN;
  const cleanLevel = String(level).toLowerCase();
  const cleanPackage = String(packageName).toLowerCase();

  if (!token || stack !== "frontend" || !allowedLevels.has(cleanLevel) || !allowedPackages.has(cleanPackage)) {
    return;
  }

  try {
    await fetch(`${apiBase}/logs`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        stack,
        level: cleanLevel,
        package: cleanPackage,
        message: String(message).slice(0, 500)
      })
    });
  } catch {
    // Logging must not block the notification experience.
  }
}

