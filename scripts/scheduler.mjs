import fs from 'node:fs/promises'
import path from 'node:path'
import { appConfig } from '../src/lib/config.js'
import { loadSchedule } from '../src/lib/storage.js'
import { updatePostsStorage } from '../src/lib/services.js'

const stateFile = path.join(appConfig.dataDir, 'scheduler_last_run.txt')
const lockFile = path.join(appConfig.dataDir, 'scheduler.lock')

const readLockPid = async () => {
  try {
    const raw = (await fs.readFile(lockFile, 'utf8')).trim()
    const pid = Number.parseInt(raw, 10)
    return Number.isFinite(pid) && pid > 0 ? pid : null
  } catch {
    return null
  }
}

const isPidAlive = (pid) => {
  try {
    process.kill(pid, 0)
    return true
  } catch (e) {
    return e.code !== 'ESRCH'
  }
}

/**
 * If another scheduler instance holds the lock and its process is still running, skip this run
 * (cron may fire every minute while a long fetch is in progress).
 * Otherwise removes a stale lock (dead pid or invalid file) so a new run can start.
 * @returns {Promise<boolean>} true when the current process should exit immediately
 */
const exitIfAnotherRunIsActive = async () => {
  try {
    await fs.access(lockFile)
  } catch {
    return false
  }
  const pid = await readLockPid()
  if (pid !== null && isPidAlive(pid)) {
    return true
  }
  await fs.unlink(lockFile).catch(() => null)
  return false
}

/**
 * @returns {Promise<boolean>} true when the lock was acquired
 */
const acquireRunLock = async () => {
  try {
    await fs.writeFile(lockFile, String(process.pid), { flag: 'wx' })
    return true
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e
    }
    if (await exitIfAnotherRunIsActive()) {
      return false
    }
    try {
      await fs.writeFile(lockFile, String(process.pid), { flag: 'wx' })
      return true
    } catch {
      return false
    }
  }
}

const getMoscowParts = () => {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = Object.fromEntries(formatter.formatToParts(new Date()).map((part) => [part.type, part.value]))
  return {
    hhmm: `${parts.hour}:${parts.minute}`,
    minuteKey: `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`,
  }
}

const readLastRun = async () => {
  try {
    return (await fs.readFile(stateFile, 'utf8')).trim()
  } catch {
    return ''
  }
}

const writeLastRun = async (value) => {
  const tmpPath = `${stateFile}.tmp`
  await fs.writeFile(tmpPath, value, 'utf8')
  await fs.rename(tmpPath, stateFile)
}

const main = async () => {
  await fs.mkdir(appConfig.dataDir, { recursive: true })

  if (await exitIfAnotherRunIsActive()) {
    return
  }

  const { hhmm, minuteKey } = getMoscowParts()
  const times = new Set((await loadSchedule()).map((entry) => String(entry).trim()).filter(Boolean))
  if (!times.has(hhmm)) {
    return
  }
  if ((await readLastRun()) === minuteKey) {
    return
  }

  if (!(await acquireRunLock())) {
    return
  }

  try {
    if ((await readLastRun()) === minuteKey) {
      return
    }
    const addedCount = await updatePostsStorage()
    await writeLastRun(minuteKey)
    process.stdout.write(`Scheduler run finished, added ${addedCount} new posts\n`)
  } finally {
    await fs.unlink(lockFile).catch(() => null)
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : 'Scheduler failed'}\n`)
  process.exit(1)
})
