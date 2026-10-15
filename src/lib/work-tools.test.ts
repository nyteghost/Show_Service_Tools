import { describe, expect, it } from "vitest";
import {
  buildIcs, classifyEvent, entryLabel, escalatorHours, expandSpace, formatMinutes, googleCalendarLink,
  mondayOf, parsePastedShifts, parseReportTime, parseShift, priceReply, reportDateToIso, summarizeEvents,
  weekLayouts, type EventRow,
} from "./work-tools";

describe("shift parsing", () => {
  it("parses simple and overnight shifts", () => {
    expect(parseShift("9a-6p")).toEqual({ start: 540, end: 1080 });
    expect(parseShift("2-10:30p")).toEqual({ start: 840, end: 1350 });
    expect(parseShift("10p-6a")).toEqual({ start: 1320, end: 1800 });
  });
  it("ignores non-shift cells", () => {
    expect(parseShift("OFF")).toBeNull();
    expect(parseShift("")).toBeNull();
  });
  it("formats minutes the way the sheets show them", () => {
    expect(formatMinutes(540)).toBe("9a");
    expect(formatMinutes(1350)).toBe("10:30p");
    expect(formatMinutes(30)).toBe("12:30a");
  });
  it("reads report times and dates", () => {
    expect(parseReportTime("06:00 AM")).toBe(360);
    expect(parseReportTime("12:30 PM")).toBe(750);
    expect(reportDateToIso("10/13/26")).toBe("2026-10-13");
  });
});

describe("pasted schedule rows", () => {
  const paste = [
    "MON\tTUE\tWED\tTHU\tFRI\tSAT\tSUN",
    "10/19/26\t10/20/26\t10/21/26\t10/22/26\t10/23/26\t10/24/26\t10/25/26",
    "Mark Brown\t9a-6p\t9a-6p\tOFF\t7a-3:30p\t\t\t",
  ].join("\n");
  it("uses the dates in the paste and skips days off", () => {
    const list = parsePastedShifts(paste, "2026-10-19", "Mark Brown");
    expect(list.map((s) => s.date)).toEqual(["2026-10-19", "2026-10-20", "2026-10-22"]);
    expect(list[2]).toEqual({ date: "2026-10-22", start: 420, end: 930, raw: "7a-3:30p" });
  });
  it("falls back to the week-start Monday and matches names case-insensitively", () => {
    const list = parsePastedShifts("Mark Brown\t9a-6p\t10p-6a\t\t\t\t\t", "2026-10-19", "mark brown");
    expect(list.map((s) => s.date)).toEqual(["2026-10-19", "2026-10-20"]);
    expect(list[1]?.end).toBe(1800);
  });
  it("returns nothing when the name is missing", () => {
    expect(parsePastedShifts(paste, "2026-10-19", "Nobody")).toEqual([]);
  });
});

describe("calendar export", () => {
  const shift = { date: "2026-10-20", start: 540, end: 1080, raw: "9a-6p" };
  it("builds a valid-looking .ics", () => {
    const ics = buildIcs([shift]);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("DTSTART;TZID=America/New_York:20261020T090000");
    expect(ics).toContain("DTEND;TZID=America/New_York:20261020T180000");
    expect(ics).toContain("UID:2026-10-20-540@show-services-tools");
  });
  it("builds a Google Calendar link", () => {
    expect(googleCalendarLink(shift)).toContain("dates=20261020T090000%2F20261020T180000");
  });
});

describe("Ungerboeck events", () => {
  const base = { start: "09:00 AM", end: "05:00 PM", space: "Exhibit Hall AB" };
  const rows: EventRow[] = [
    { ...base, level: 2, usage: "Event (EVT)", description: "Gaming Expo", date: "2026-10-20" },
    { ...base, level: 2, usage: "Move In", description: "Gaming Expo exhibitor move in", date: "2026-10-19", start: "07:00 AM", end: "06:00 PM" },
    { ...base, level: 2, usage: "Move Out", description: "Gaming Expo", date: "2026-10-21", start: "06:00 PM", end: "11:00 PM" },
    { ...base, level: 1, usage: "Event", description: "date header", date: "2026-10-20" },
    { ...base, level: 2, usage: "Event", description: "Early access", date: "2026-10-20" },
  ];
  it("classifies rows by the show-services rules", () => {
    expect(rows.map((r) => classifyEvent(r))).toEqual(["S", "Exmi", "MO", null, null]);
  });
  it("splits combined halls into one entry per hall", () => {
    expect(expandSpace("Exhibit Hall AB")).toEqual(["Hall A", "Hall B"]);
    expect(expandSpace("Chattahoochee Ballroom")).toHaveLength(7);
    expect(expandSpace("Lobby")).toEqual(["Lobby"]);
  });
  const entries = summarizeEvents(rows);
  it("summarizes into per-hall entries in date order", () => {
    expect(entries).toHaveLength(6);
    expect(entries.map(entryLabel)).toEqual(["Exmi 7a-6p", "Exmi 7a-6p", "S 9a-5p", "S 9a-5p", "MO 6p-11p", "MO 6p-11p"]);
  });
  it("runs escalators from 1 hr before the first show to 1 hr after the last", () => {
    expect([...escalatorHours(entries)]).toEqual([["2026-10-20", { start: 480, end: 1080 }]]);
  });
  it("lays entries out in Monday–Sunday weeks", () => {
    expect(mondayOf("2026-10-20")).toBe("2026-10-19");
    const [week] = weekLayouts(entries);
    expect(week?.cgc).toEqual(["7a-6p", "9a-5p", "6p-11p", "DARK", "DARK", "DARK", "DARK"]);
    expect(week?.escalator[1]).toBe("8a-6p");
    expect(week?.rows["Hall A"]?.[1]?.text).toBe("Gaming Expo\nS 9a-5p");
  });
});

describe("vendor search", () => {
  it("builds links for every vendor", () => {
    const reply = priceReply("@price gaffer tape 2in black") ?? "";
    expect(reply).toContain("grainger.com/search?searchQuery=gaffer%20tape%202in%20black");
    expect(reply).toContain("mcmaster.com/gaffer%20tape%202in%20black");
  });
  it("asks for an item and ignores other text", () => {
    expect(priceReply("@price")).toContain("Tell me what to look for");
    expect(priceReply("hello")).toBeNull();
  });
});
