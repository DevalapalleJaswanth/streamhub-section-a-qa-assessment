# SQL Scenario 2 — IPL 2024 batting streaks (SQLite)

**SQL dialect: SQLite**

This scenario identifies players who scored at least 30 runs in three or more
uninterrupted appearances during the 2024 season. The result contains one row
per qualifying streak, with the date on which that streak started.

## Files

- `schema.sql` creates the SQLite-compatible `player_performances` table.
- `seed.sql` inserts qualifying streaks and deliberate non-qualifying cases.
- `query.sql` uses SQLite window functions and a gaps-and-islands grouping
  technique to find the qualifying streaks.

No database server is required. The validation database is temporary and is
only used to validate this SQL assessment.

## Schema

`player_performances` has these fields:

- `performance_id`: unique performance identifier and deterministic tie-breaker.
- `player_name`: player identity.
- `match_date`: ISO-8601 match date stored as SQLite text.
- `opponent`: opponent abbreviation.
- `runs`: runs scored in that appearance; values must be non-negative.
- `season`: season filter value.

The index supports the season/player/date ordering used by the query.

## Seed data design

The seed data deliberately includes multiple players on overlapping match
dates. Its expected cases are:

| Player | Expected result | Reason |
| --- | --- | --- |
| Ruturaj Gaikwad | `2024-03-22` | Four qualifying appearances, then a 10-run break |
| Virat Kohli | `2024-03-22` | Three qualifying appearances, then a 29-run break |
| Shubman Gill | `2024-04-12` | `40, 35, 10` breaks the first group; `45, 50, 60` qualifies |
| Rishabh Pant | `2024-05-01` | Four qualifying appearances; one result, not overlapping 3-match results |

The seed also includes Suryakumar Yadav and KL Rahul with non-consecutive
30-plus scores, and Jasprit Bumrah with exactly two consecutive 30-plus scores.
None of those players should be returned. A 2023 Virat Kohli row verifies that
only season 2024 is considered.

## Window-function logic

1. `season_appearances` filters to `season = 2024` and assigns each player's
   appearance number with `ROW_NUMBER()`, ordered by `match_date` and then
   `performance_id`.
2. `qualifying_appearances` keeps only `runs >= 30` and assigns a second row
   number to each player's qualifying appearances.
3. In `grouped_streaks`, the difference
   `appearance_number - qualifying_number` is constant for one uninterrupted
   qualifying run. A below-30 appearance changes that difference for later
   qualifying rows, creating a new gaps-and-islands group.
4. `streak_summary` groups by player and that streak-group key, takes the
   minimum match date as the commencement date, and counts the group rows.
5. The final filter keeps only groups with `streak_length >= 3`.

This defines consecutive matches as consecutive appearances for that player,
not consecutive calendar dates. For example, a player's qualifying rows on
April 1, April 8, and April 20 still form a three-appearance streak if the
player's intervening appearances also scored at least 30; no date arithmetic is
used.

## Expected results reviewed before execution

| player_name | streak_start_date |
| --- | --- |
| Ruturaj Gaikwad | 2024-03-22 |
| Virat Kohli | 2024-03-22 |
| Shubman Gill | 2024-04-12 |
| Rishabh Pant | 2024-05-01 |

## Local validation

From the repository root, execute:

```bash
sqlite3 assessment_sql_scenario_2.db < sql/scenario-2-ipl-streak/schema.sql
sqlite3 assessment_sql_scenario_2.db < sql/scenario-2-ipl-streak/seed.sql
sqlite3 -header -column assessment_sql_scenario_2.db < sql/scenario-2-ipl-streak/query.sql
```

The checked-in output is captured at
`submission-results/sql-results/scenario-2-ipl-streak-output.txt`. The temporary
`assessment_sql_scenario_2.db` file should not be committed.
