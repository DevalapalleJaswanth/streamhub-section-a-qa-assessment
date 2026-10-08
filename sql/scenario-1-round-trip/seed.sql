-- SQLite seed data for Scenario 1.
-- Timestamps use ISO-8601 UTC text (YYYY-MM-DD HH:MM:SS).

INSERT INTO money_transactions (
    transaction_id,
    sender_account,
    receiver_account,
    amount,
    transaction_timestamp
)
VALUES
    -- Qualifies: 5% return, 11 hours later.
    (1001, 'ACCT-A100', 'ACCT-B200', 1000.00, '2026-03-01 09:00:00'),
    (1002, 'ACCT-B200', 'ACCT-A100', 1050.00, '2026-03-01 20:00:00'),

    -- Qualifies: 8% return, 23 hours later.
    (1003, 'ACCT-C300', 'ACCT-D400', 2500.00, '2026-03-02 08:00:00'),
    (1004, 'ACCT-D400', 'ACCT-C300', 2300.00, '2026-03-03 07:00:00'),

    -- Qualifies: approximately 6.67% return, 23 hours later.
    (1005, 'ACCT-E500', 'ACCT-F600', 75.00, '2026-03-04 14:00:00'),
    (1006, 'ACCT-F600', 'ACCT-E500', 70.00, '2026-03-05 13:00:00'),

    -- Outside the 24-hour window: exactly 25 hours, otherwise within 10%.
    (1007, 'ACCT-G700', 'ACCT-H800', 900.00, '2026-03-06 08:00:00'),
    (1008, 'ACCT-H800', 'ACCT-G700', 810.00, '2026-03-07 09:00:00'),

    -- Not similar enough: 20% return difference, despite being within 24 hours.
    (1009, 'ACCT-I900', 'ACCT-J010', 1000.00, '2026-03-08 10:00:00'),
    (1010, 'ACCT-J010', 'ACCT-I900', 1200.00, '2026-03-08 18:00:00'),

    -- Same direction only: no reverse transaction exists.
    (1011, 'ACCT-K110', 'ACCT-L120', 400.00, '2026-03-09 10:00:00'),
    (1012, 'ACCT-K110', 'ACCT-L120', 390.00, '2026-03-09 15:00:00'),

    -- Unrelated transaction: it has no matching reverse route.
    (1013, 'ACCT-M130', 'ACCT-N140', 600.00, '2026-03-10 10:00:00'),

    -- Mirrored-match guard: this one pair must be returned once, not once per join orientation.
    (1014, 'ACCT-P150', 'ACCT-Q160', 1200.00, '2026-03-11 09:00:00'),
    (1015, 'ACCT-Q160', 'ACCT-P150', 1180.00, '2026-03-11 10:00:00'),

    -- Boundary case: exactly 10% difference is included by the <= comparison.
    (1016, 'ACCT-R170', 'ACCT-S180', 100.00, '2026-03-12 09:00:00'),
    (1017, 'ACCT-S180', 'ACCT-R170', 110.00, '2026-03-12 12:00:00');
