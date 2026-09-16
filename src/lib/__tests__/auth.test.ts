import { beforeEach, describe, expect, it } from "vitest";
import {
  checkCredentials,
  createSessionToken,
  verifySessionToken,
} from "../auth";

beforeEach(() => {
  process.env.SESSION_SECRET = "a-sufficiently-long-test-secret-value";
  process.env.ADMIN_USERNAME = "admin";
  process.env.ADMIN_PASSWORD = "correct-horse-battery-staple";
});

describe("checkCredentials", () => {
  it("accepts the configured username/password", () => {
    expect(checkCredentials("admin", "correct-horse-battery-staple")).toBe(true);
  });

  it("rejects a wrong password", () => {
    expect(checkCredentials("admin", "wrong")).toBe(false);
  });

  it("rejects a wrong username", () => {
    expect(checkCredentials("nope", "correct-horse-battery-staple")).toBe(false);
  });

  it("rejects when credentials are not configured", () => {
    delete process.env.ADMIN_PASSWORD;
    expect(checkCredentials("admin", "anything")).toBe(false);
  });
});

describe("session tokens", () => {
  it("round-trips a valid token", () => {
    const token = createSessionToken("admin");
    expect(verifySessionToken(token)).toBe(true);
  });

  it("rejects a tampered token", () => {
    const token = createSessionToken("admin");
    const tampered = `${token.slice(0, -1)}0`;
    expect(verifySessionToken(tampered)).toBe(false);
  });

  it("rejects a missing token", () => {
    expect(verifySessionToken(undefined)).toBe(false);
    expect(verifySessionToken(null)).toBe(false);
  });

  it("rejects garbage input", () => {
    expect(verifySessionToken("not-a-real-token")).toBe(false);
  });
});
