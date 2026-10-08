# SQL Scenario 1 — Round-trip transfers (SQLite)

**SQL dialect: SQLite**

This scenario finds likely quick payment reversals: Account A sends money to
Account B, then Account B sends a similar amount back to Account A within 24
hours.

## Files

- `schema.sql` creates the SQLite-compatible `money_transactions` table.
- `seed.sql` inserts qualifying and non-qualifying test cases.
- `query.sql` self-joins the table to find the round trips.

No database server is required. The database file is temporary and is only
used to validate this SQL assessment.

## Expected qualifying pairs (manually reviewed before running the query)

| Original | Return | Why it qualifies |
| ---: | ---: | --- |
| 1001 | 1002 | Reverse route; 11 hours; 5.00% difference |
| 1003 | 1004 | Reverse route; 23 hours; 8.00% difference |
| 1005 | 1006 | Reverse route; 23 hours; 6.67% difference |
| 1014 | 1015 | Reverse route; 1 hour; 1.67% difference; mirrored-match guard |
| 1016 | 1017 | Reverse route; 3 hours; exactly 10.00%, the inclusive boundary |

The expected result contains five rows. Pair `1014`/`1015` is deliberately
included to demonstrate that a symmetric join must not emit the same pair in
both orientations. The query uses
`julianday(t2.transaction_timestamp) > julianday(t1.transaction_timestamp)`, so
the earlier transaction is always the original and the pair is emitted once.

The following seeded cases must not qualify:

- `1007`/`1008`: the return occurs after 25 hours, outside the 24-hour window.
- `1009`/`1010`: the return differs by 20%, outside the 10% limit.
- `1011`/`1012`: both transactions have the same direction; there is no reverse route.
- `1013`: no unrelated reverse transaction exists.

## 10% comparison logic

The query calculates the difference relative to the original amount:

```sql
ABS(t2.amount - t1.amount) * 1.0 / NULLIF(t1.amount, 0) <= 0.10
```

`ABS` makes the difference positive, `NULLIF` prevents division by zero, and
`<=` makes the 10% boundary inclusive. The selected percentage is the same
ratio multiplied by 100 and rounded to two decimal places. The query uses
`1.0`/`100.0` so SQLite performs real-number division even when a numeric
amount is stored with integer affinity.

## Join and filter logic

The table is joined to itself as `t1` (original transfer) and `t2` (return
transfer). The two route predicates reverse sender and receiver. The timestamp
predicates enforce a strictly later return no more than 24 hours after the
original. The amount predicate enforces the similarity threshold. Strict time
ordering avoids duplicate mirrored output without requiring `DISTINCT`.

## Local validation

From the repository root, execute the following SQLite commands:

```bash
sqlite3 assessment_sql.db < sql/scenario-1-round-trip/schema.sql
sqlite3 assessment_sql.db < sql/scenario-1-round-trip/seed.sql
sqlite3 assessment_sql.db < sql/scenario-1-round-trip/query.sql
```

The validation database file `assessment_sql.db` is temporary and should not be
committed. The checked-in query output is captured at
`submission-results/sql-results/scenario-1-round-trip-output.txt`; final
screenshots will be stored under `submission-results/sql-results/`.
