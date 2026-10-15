import { describe, expect, it } from "vitest";
import { deckReply, parseDeckCommand, planStage, stairsFor } from "./deck-solver";

describe("deck planner", () => {
  it("plans a 24×24 stage with 18 decks", () => {
    const r = planStage(24, 24);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.decks).toHaveLength(18);
  });
  it("handles a single 4×8 deck", () => {
    const r = planStage(4, 8);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.decks).toHaveLength(1);
  });
  it("rejects sizes that can't be built", () => {
    expect(planStage(10, 10)).toEqual({ ok: false, reason: "Width and length must be multiples of 4 ft — 4×8 decks can't be cut to fit otherwise." });
    expect(planStage(12, 12)).toEqual({ ok: false, reason: "At least one side must be a multiple of 8 ft." });
    expect(planStage(0, 8)).toEqual({ ok: false, reason: "Enter a width and length greater than zero." });
  });
  it("suggests stairs by height", () => {
    expect([stairsFor(32), stairsFor(36), stairsFor(44)]).toEqual(["5-step", "6-step", "7-step"]);
  });
  it("parses size commands", () => {
    expect(parseDeckCommand("@deck 24x24x32")).toEqual({ width: 24, length: 24, height: 32 });
    expect(parseDeckCommand("@stage 16×16")).toEqual({ width: 16, length: 16, height: 32 });
    expect(parseDeckCommand("hi")).toBeNull();
  });
  it("writes a friendly reply", () => {
    const reply = deckReply("@deck 24x24x32") ?? "";
    expect(reply).toContain("**Stage 24×24 ft @ 32\"** — 576 sq ft");
    expect(reply).toContain("**Decks (4×8):** 18 of 72 in stock");
    expect(reply).toContain("5-step suggested");
  });
  it("explains bad input", () => {
    expect(deckReply("@deck 24x24x50")).toContain("Height must be 32");
    expect(deckReply("@deck")).toContain("Give me a size");
    expect(deckReply("nothing")).toBeNull();
  });
});
