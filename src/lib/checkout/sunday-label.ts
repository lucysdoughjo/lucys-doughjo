import { addDays } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

const PACIFIC = "America/Los_Angeles";

/** Next Sunday on or after `now` in Pacific time (for fulfillment copy). */
export function getNextSundayPacificLabel(now = new Date()): string {
  const zoned = toZonedTime(now, PACIFIC);
  const day = zoned.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  const sunday = addDays(zoned, daysUntilSunday);
  const utcSunday = fromZonedTime(
    new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 12, 0, 0),
    PACIFIC,
  );

  return utcSunday.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
