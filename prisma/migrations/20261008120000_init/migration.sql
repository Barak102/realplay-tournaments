-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "tournaments" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bets" (
    "id" UUID NOT NULL,
    "externalBetId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "bets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_bets" (
    "tournamentId" UUID NOT NULL,
    "betId" UUID NOT NULL,

    CONSTRAINT "tournament_bets_pkey" PRIMARY KEY ("tournamentId","betId")
);

-- CreateIndex
CREATE INDEX "tournaments_startsAt_endsAt_idx" ON "tournaments"("startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "tournaments_endsAt_idx" ON "tournaments"("endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "bets_externalBetId_key" ON "bets"("externalBetId");

-- CreateIndex
CREATE INDEX "tournament_bets_betId_idx" ON "tournament_bets"("betId");

-- AddForeignKey
ALTER TABLE "tournament_bets" ADD CONSTRAINT "tournament_bets_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_bets" ADD CONSTRAINT "tournament_bets_betId_fkey" FOREIGN KEY ("betId") REFERENCES "bets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Monetary values remain exact when represented by the JSON number contract.
ALTER TABLE "bets" ADD CONSTRAINT "bets_amount_valid" CHECK ("amount" > 0 AND "amount" <= 9007199254740991);

ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_dates_valid" CHECK ("startsAt" < "endsAt");
