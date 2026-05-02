const BASE_URL = "http://20.207.122.201/evaluation-service";

module.exports = {
  baseUrl: process.env.NOTIFICATION_BASE_URL || BASE_URL,
  port: Number(process.env.PORT || 3000),
  authToken: process.env.AUTH_TOKEN || "",
  defaultLimit: Number(process.env.PRIORITY_LIMIT || 10)
};

