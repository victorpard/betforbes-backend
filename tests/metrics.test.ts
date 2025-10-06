import request from "supertest";
import app from "../src/app";

describe("Metrics Flow", () => {
  it("Deposit → 0%", async () => {
    const res = await request(app)
      .post("/api/metrics/test")
      .send({ type: "deposit", value: 1000 });
    expect(res.body.commission).toBe(0);
  });

  it("Execution → 2%", async () => {
    const res = await request(app)
      .post("/api/metrics/test")
      .send({ type: "execution", value: 1000 });
    expect(res.body.commission).toBe(20);
  });

  it("Close with profit → 5%", async () => {
    const res = await request(app)
      .post("/api/metrics/test")
      .send({ type: "close", profit: 1000 });
    expect(res.body.commission).toBe(50);
  });

  it("Close with loss → 0%", async () => {
    const res = await request(app)
      .post("/api/metrics/test")
      .send({ type: "close", profit: -500 });
    expect(res.body.commission).toBe(0);
  });

  it("Withdraw → 2%", async () => {
    const res = await request(app)
      .post("/api/metrics/test")
      .send({ type: "withdraw", value: 1000 });
    expect(res.body.commission).toBe(20);
  });
});
