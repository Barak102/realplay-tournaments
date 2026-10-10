-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN "finalizedAt" TIMESTAMPTZ(3);

-- CreateTable
CREATE TABLE "tournament_placements" (
    "tournamentId" UUID NOT NULL,
    "playerId" TEXT NOT NULL,
    "score" BIGINT NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "tournament_placements_pkey" PRIMARY KEY ("tournamentId", "playerId")
);

-- CreateIndex
CREATE UNIQUE INDEX "tournament_placements_tournamentId_rank_key" ON "tournament_placements"("tournamentId", "rank");

-- AddForeignKey
ALTER TABLE "tournament_placements" ADD CONSTRAINT "tournament_placements_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Snapshot values must remain valid.
ALTER TABLE "tournament_placements" ADD CONSTRAINT "tournament_placements_score_valid" CHECK ("score" > 0);
ALTER TABLE "tournament_placements" ADD CONSTRAINT "tournament_placements_rank_valid" CHECK ("rank" > 0);
