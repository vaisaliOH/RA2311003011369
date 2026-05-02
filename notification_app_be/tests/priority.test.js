const assert = require("assert");
const { topPriorityNotifications } = require("../src/priority");

const sample = [
  {
    ID: "result-old",
    Type: "Result",
    Message: "mid-sem",
    Timestamp: "2026-04-22 17:50:54"
  },
  {
    ID: "placement-new",
    Type: "Placement",
    Message: "CSX Corporation hiring",
    Timestamp: "2026-04-22 17:51:18"
  },
  {
    ID: "event-new",
    Type: "Event",
    Message: "tech-fest",
    Timestamp: "2026-04-22 17:51:30"
  },
  {
    ID: "result-new",
    Type: "Result",
    Message: "project-review",
    Timestamp: "2026-04-22 17:51:42"
  },
  {
    ID: "placement-read",
    Type: "Placement",
    Message: "already opened",
    Timestamp: "2026-04-22 18:00:00",
    read: true
  }
];

const result = topPriorityNotifications(sample, 3);

assert.deepStrictEqual(
  result.map((notification) => notification.ID),
  ["placement-new", "result-new", "result-old"]
);

process.stdout.write("priority ranking test passed\n");

