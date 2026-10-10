# RealPlay Tournaments

## 1. Overview

RealPlay Tournaments is a small service for creating timed tournaments and accepting player bets. It provides live leaderboards and saves the final results when each tournament ends.

## 2. Quick Start

```shell
docker compose up --build
```

The API runs at [http://localhost:3000](http://localhost:3000). Check that it is ready with `GET /health`. Docker Compose includes local defaults, so `.env` is optional; copy `.env.example` to `.env` only when you want to change them.

## 3. Components

| Component | Purpose |
| --- | --- |
| API | Handles tournament, bet, and leaderboard requests. |
| PostgreSQL | Stores tournaments, bets, associations, and final results. |
| Redis | Stores live leaderboard scores and BullMQ jobs. |
| BullMQ | Schedules tournament finalization at the tournament end time. |
| Worker | Processes finalization jobs and saves final rankings. |

## 4. Database

| Table | Purpose |
| --- | --- |
| Tournament | Stores tournament details, dates, and finalization status. |
| Bet | Stores each unique bet event and its amount. |
| TournamentBet | Links a bet to every matching tournament. |
| TournamentPlacement | Stores each player's final score and rank. |

## 5. How It Works

1. A client creates a tournament, which is saved in PostgreSQL.
2. BullMQ schedules a job for the tournament's end time.
3. A client submits a bet, which is saved and linked to matching tournaments.
4. The player's total score is calculated from PostgreSQL and updated in Redis.
5. Clients read the live leaderboard with limit and offset pagination.
6. When the tournament ends, the worker calculates and saves final placements in PostgreSQL.

## 6. API

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/tournaments` | Creates a tournament. |
| POST | `/bet` | Submits a bet event. |
| GET | `/tournaments/:id/leaderboard?limit=10&offset=0` | Returns the live leaderboard. |

Create a tournament:

```json
{
  "name": "Weekend Tournament",
  "startsAt": "2030-01-01T10:00:00.000Z",
  "endsAt": "2030-01-01T12:00:00.000Z"
}
```

Submit a bet:

```json
{
  "externalBetId": "bet-10001",
  "playerId": "player-42",
  "amount": 250,
  "currency": "USD",
  "createdAt": "2030-01-01T10:30:00.000Z"
}
```

## 7. Notes

- Bets are saved even when no tournament matches.
- One bet can count toward multiple tournaments.
- Duplicate bets are not counted twice.
- PostgreSQL is the source of truth.
- Late-arriving bets may not appear in an already finalized snapshot.
