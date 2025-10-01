-- Minimal, additive only: create FunnelEvent + indexes
CREATE TABLE IF NOT EXISTS "FunnelEvent" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "email" TEXT,
  "affiliateId" TEXT,
  "kind" TEXT NOT NULL,
  "origin" TEXT,
  "meta" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "FunnelEvent_kind_createdAt_idx"
  ON "FunnelEvent" ("kind","createdAt");

CREATE INDEX IF NOT EXISTS "FunnelEvent_userId_createdAt_idx"
  ON "FunnelEvent" ("userId","createdAt");
