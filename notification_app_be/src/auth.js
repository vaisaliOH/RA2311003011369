const { loadEnv } = require("./loadEnv");
loadEnv();

const { baseUrl } = require("./config");

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

async function main() {
  const payload = {
    email: requiredEnv("EMAIL"),
    name: requiredEnv("FULL_NAME"),
    rollNo: requiredEnv("ROLL_NO"),
    accessCode: requiredEnv("ACCESS_CODE"),
    clientID: requiredEnv("CLIENT_ID"),
    clientSecret: requiredEnv("CLIENT_SECRET")
  };

  const response = await fetch(`${baseUrl}/auth`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message || body.error || `auth failed with ${response.status}`);
  }

  process.stdout.write(`${JSON.stringify(body, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
