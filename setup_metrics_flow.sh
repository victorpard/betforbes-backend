#!/bin/bash
set -e

echo "🚀 Criando estrutura de métricas no branch $(git branch --show-current)..."

# Controller
mkdir -p src/controllers
cat > src/controllers/metricsTestController.ts <<'EOF'
import { Request, Response } from "express";

export const calculateMetrics = (req: Request, res: Response) => {
  const { type, value, profit } = req.body;
  let commission = 0;

  switch (type) {
    case "deposit":
      commission = 0;
      break;
    case "execution":
      commission = value * 0.02;
      break;
    case "close":
      commission = profit > 0 ? profit * 0.05 : 0;
      break;
    case "withdraw":
      commission = value * 0.02;
      break;
    default:
      return res.status(400).json({ error: "Tipo inválido" });
  }

  return res.json({ commission });
};
EOF

# Routes
mkdir -p src/routes
cat > src/routes/metricsTestRoutes.ts <<'EOF'
import { Router } from "express";
import { calculateMetrics } from "../controllers/metricsTestController";

const router = Router();

router.post("/metrics/test", calculateMetrics);

export default router;
EOF

# Ajuste app.ts (se ainda não estiver importado)
if ! grep -q "metricsTestRoutes" src/app.ts; then
  sed -i '/import.*express/a import metricsTestRoutes from "./routes/metricsTestRoutes";' src/app.ts
  sed -i '/app.use(/a \ \ app.use("/api", metricsTestRoutes);' src/app.ts
fi

# Tests
mkdir -p tests
cat > tests/metrics.test.ts <<'EOF'
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
EOF

echo "✅ Estrutura criada com sucesso!"
echo "👉 Agora rode: npm run test"
