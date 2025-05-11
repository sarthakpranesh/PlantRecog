import { AppState } from "react-native";
import PerformanceStats, {
  PerformanceStatsData,
} from "react-native-performance-stats";

import { createPerformanceRecords, createSession } from "./services/rno";

let BACKLOG_BATCHED_PERFORMANCE_DATA = [];
let BATCHED_PERFORMANCE_DATA = [];
let SESSION_ID = null;

const fetchAndStoreSession = async () => {
  if (!SESSION_ID) {
    const resp = await createSession();
    SESSION_ID = resp?.data?.sessionId;
  }
};

const reportPerformanceData = async () => {
  await fetchAndStoreSession();

  if (SESSION_ID) {
    BACKLOG_BATCHED_PERFORMANCE_DATA.push(...BATCHED_PERFORMANCE_DATA);
    BATCHED_PERFORMANCE_DATA = [];

    const resp = await createPerformanceRecords(
      BACKLOG_BATCHED_PERFORMANCE_DATA,
      SESSION_ID
    );

    if (resp?.success) {
      BACKLOG_BATCHED_PERFORMANCE_DATA = [];
    }
  }
};

const batchPerformanceData = (stats: PerformanceStatsData) => {
  const data = {
    timestamp: Date.now(),
    uiFps: stats.uiFps,
    jsFps: stats.jsFps,
    memoryUsage: stats.usedRam,
    cpuUsage: stats.usedCpu,
  };
  BATCHED_PERFORMANCE_DATA.push(data);

  if (
    BATCHED_PERFORMANCE_DATA.length % 50 === 0 &&
    BATCHED_PERFORMANCE_DATA.length > 0
  ) {
    reportPerformanceData();
  }

  console.log(BATCHED_PERFORMANCE_DATA.length);
};

const flushPerformanceReports = async () => {
  await reportPerformanceData();
};

PerformanceStats.addListener(batchPerformanceData);

// you must call .start(true) to get CPU as well
// PerformanceStats.start();
// also get a session id
fetchAndStoreSession();

AppState.addEventListener("change", (state) => {
  console.log("AppState", state);
  if (state === "active") {
    PerformanceStats.start();
  } else {
    PerformanceStats.stop();
    flushPerformanceReports();
  }
});

export { flushPerformanceReports };
