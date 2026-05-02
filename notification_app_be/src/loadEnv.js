const fs = require("fs");
const path = require("path");

function loadEnv(filePath = path.join(__dirname, "..", ".env")) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const rows = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const row of rows) {
    const trimmed = row.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

module.exports = {
  loadEnv
};

