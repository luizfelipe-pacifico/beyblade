-- CreateEnum
CREATE TYPE "FinishType" AS ENUM ('spin', 'ringout', 'xtreme', 'burst', 'decision', 'draw');

-- CreateTable
CREATE TABLE "controller_configs" (
    "slot" SMALLINT NOT NULL,
    "config" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "controller_configs_pkey" PRIMARY KEY ("slot")
);

-- CreateTable
CREATE TABLE "settings" (
    "key" VARCHAR(64) NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" SERIAL NOT NULL,
    "p1_name" VARCHAR(24) NOT NULL,
    "p1_bey" VARCHAR(32) NOT NULL,
    "p1_score" SMALLINT NOT NULL,
    "p2_name" VARCHAR(24) NOT NULL,
    "p2_bey" VARCHAR(32) NOT NULL,
    "p2_score" SMALLINT NOT NULL,
    "winner" SMALLINT NOT NULL,
    "target_points" SMALLINT NOT NULL,
    "duration_ms" INTEGER NOT NULL,
    "played_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_rounds" (
    "match_id" INTEGER NOT NULL,
    "number" SMALLINT NOT NULL,
    "winner" SMALLINT NOT NULL,
    "finish" "FinishType" NOT NULL,
    "points" SMALLINT NOT NULL,

    CONSTRAINT "match_rounds_pkey" PRIMARY KEY ("match_id","number")
);

-- CreateIndex
CREATE INDEX "matches_played_at_idx" ON "matches"("played_at" DESC);

-- AddForeignKey
ALTER TABLE "match_rounds" ADD CONSTRAINT "match_rounds_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
