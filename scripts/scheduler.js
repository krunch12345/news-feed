import fs from "node:fs/promises";
import path from "node:path";
import { appConfig } from "../src/lib/config.js";
import { loadSchedule } from "../src/lib/storage.js";
import { updatePostsStorage } from "../src/lib/services.js";

const stateFile = path.join(appConfig.dataDir, "scheduler_last_run.txt");
const lockFile = path.join(appConfig.dataDir, "scheduler.lock");

const getMoscowParts = () => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(formatter.formatToParts(new Date()).map((part) => [part.type, part.value]));
  return {
    hhmm: `${parts.hour}:${parts.minute}`,
    minuteKey: `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`,
  };
};

const readLastRun = async () => {
  try {
    return (await fs.readFile(stateFile, "utf8")).trim();
  } catch {
    return "";
  }
};

const writeLastRun = async (value) => {
  const tmpPath = `${stateFile}.tmp`;
  await fs.writeFile(tmpPath, value, "utf8");
  await fs.rename(tmpPath, stateFile);
};

const main = async () => {
  await fs.mkdir(appConfig.dataDir, { recursive: true });

  const { hhmm, minuteKey } = getMoscowParts();
  const times = new Set((await loadSchedule()).map((entry) => String(entry).trim()).filter(Boolean));
  if (!times.has(hhmm)) {
    return;
  }
  if ((await readLastRun()) === minuteKey) {
    return;
  }

  let lockHandle;
  try {
    lockHandle = await fs.open(lockFile, "wx");
  } catch {
    return;
  }

  try {
    if ((await readLastRun()) === minuteKey) {
      return;
    }
    const addedCount = await updatePostsStorage();
    await writeLastRun(minuteKey);
    process.stdout.write(`Scheduler run finished, added ${addedCount} new posts\n`);
  } finally {
    await lockHandle.close().catch(() => null);
    await fs.unlink(lockFile).catch(() => null);
  }
};

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Scheduler failed"}\n`);
  process.exit(1);
});
