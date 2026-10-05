import { addDays, setHours, setMinutes, setSeconds, setMilliseconds } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

const PACIFIC = "America/Los_Angeles";

export type DropStatus = "open" | "closed" | "soldOut";

export type OrderWindowStatus =
  | "open"
  | "closing_soon"
  | "closed"
  | "sold_out";

export type OrderWindowState = {
  isOpen: boolean;
  status: OrderWindowStatus;
  label: string;
  closesAt: Date | null;
  nextOpensAt: Date | null;
};

export type OrderWindowInput = {
  forceClosed?: boolean;
  customOpenAt?: string | null;
  customCloseAt?: string | null;
  dropStatus?: DropStatus | null;
};

function startOfMondayPacific(reference: Date): Date {
  const zoned = toZonedTime(reference, PACIFIC);
  const day = zoned.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = addDays(zoned, mondayOffset);
  const mondayMidnight = setMilliseconds(
    setSeconds(setMinutes(setHours(monday, 0), 0), 0),
    0,
  );
  return fromZonedTime(mondayMidnight, PACIFIC);
}

function wednesdayClosePacific(mondayOpen: Date): Date {
  const zonedMonday = toZonedTime(mondayOpen, PACIFIC);
  const wednesday = addDays(zonedMonday, 2);
  const wednesdayEightPm = setMilliseconds(
    setSeconds(setMinutes(setHours(wednesday, 20), 0), 0),
    0,
  );
  return fromZonedTime(wednesdayEightPm, PACIFIC);
}

function getDefaultWindow(now: Date) {
  const openAt = startOfMondayPacific(now);
  const closeAt = wednesdayClosePacific(openAt);
  return { openAt, closeAt };
}

function formatPacificDateTime(date: Date) {
  return date.toLocaleString("en-US", {
    timeZone: PACIFIC,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function closedLabel(nextOpensAt: Date | null) {
  if (!nextOpensAt) {
    return "This week's drop is closed.";
  }
  return `Orders open again ${formatPacificDateTime(nextOpensAt)} Pacific.`;
}

export function getOrderWindowState(
  now = new Date(),
  input: OrderWindowInput = {},
): OrderWindowState {
  const { forceClosed, customOpenAt, customCloseAt, dropStatus } = input;

  if (dropStatus === "soldOut") {
    const thisMonday = startOfMondayPacific(now);
    const nextOpensAt =
      now >= thisMonday ? addDays(thisMonday, 7) : thisMonday;

    return {
      isOpen: false,
      status: "sold_out",
      label:
        "This week's drop is sold out. Next drop opens Monday morning Pacific.",
      closesAt: null,
      nextOpensAt,
    };
  }

  let openAt: Date;
  let closeAt: Date;

  if (customOpenAt && customCloseAt) {
    openAt = new Date(customOpenAt);
    closeAt = new Date(customCloseAt);
  } else {
    ({ openAt, closeAt } = getDefaultWindow(now));
  }

  const nextOpensAt = addDays(openAt, 7);

  if (forceClosed || dropStatus === "closed") {
    return {
      isOpen: false,
      status: "closed",
      label: closedLabel(now < closeAt ? openAt : nextOpensAt),
      closesAt: closeAt,
      nextOpensAt: now < closeAt ? openAt : nextOpensAt,
    };
  }

  const isOpen = now >= openAt && now < closeAt;

  if (!isOpen) {
    const opensNext = now >= closeAt ? nextOpensAt : openAt;
    return {
      isOpen: false,
      status: "closed",
      label: closedLabel(opensNext),
      closesAt: closeAt,
      nextOpensAt: opensNext,
    };
  }

  const hoursUntilClose =
    (closeAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  const closingSoon = hoursUntilClose <= 24;

  return {
    isOpen: true,
    status: closingSoon ? "closing_soon" : "open",
    label: closingSoon
      ? `Closing soon — order by ${formatPacificDateTime(closeAt)} Pacific.`
      : `Orders open until Wednesday 8 PM Pacific (${formatPacificDateTime(closeAt)}).`,
    closesAt: closeAt,
    nextOpensAt: null,
  };
}
