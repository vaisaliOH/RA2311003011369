const { loadEnv } = require("./loadEnv");
loadEnv();

const { defaultLimit } = require("./config");
const { fetchNotifications } = require("./notificationClient");
const { topPriorityNotifications } = require("./priority");
const { Log } = require("../../logging_middleware");

async function main() {
  const limitArg = Number(process.argv[2] || defaultLimit);
  const limit = Number.isFinite(limitArg) && limitArg > 0 ? limitArg : defaultLimit;

  await Log("backend", "info", "handler", `CLI priority check started for top ${limit}`);
  const notifications = await fetchNotifications();
  const priority = topPriorityNotifications(notifications, limit);

  process.stdout.write(`${JSON.stringify({ count: priority.length, priority }, null, 2)}\n`);
  await Log("backend", "info", "handler", `CLI priority check completed with ${priority.length} records`);
}

main().catch(async (error) => {
  await Log("backend", "fatal", "handler", error.message).catch(() => {});
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
