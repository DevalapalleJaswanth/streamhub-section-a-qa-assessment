-- SQLite Scenario 1: identify quick round-trip transfers.
--
-- The percentage is measured against the original transaction (t1):
--   ABS(return_amount - original_amount) / original_amount
-- A value <= 0.10 means the return is within 10% of the original amount.
-- The 1.0/100.0 multipliers force real-number division in SQLite when both
-- amounts happen to have integer storage affinity.

SELECT
    t1.transaction_id AS original_transaction_id,
    t2.transaction_id AS return_transaction_id,
    t1.sender_account AS account_a,
    t1.receiver_account AS account_b,
    t1.amount AS original_amount,
    t2.amount AS return_amount,
    t1.transaction_timestamp AS original_timestamp,
    t2.transaction_timestamp AS return_timestamp,
    ROUND(
        (ABS(t2.amount - t1.amount) * 100.0) / NULLIF(t1.amount, 0),
        2
    ) AS amount_difference_percent,
    ROUND(
        (julianday(t2.transaction_timestamp) - julianday(t1.transaction_timestamp)) * 24,
        2
    ) AS hours_between_transactions
FROM money_transactions AS t1
JOIN money_transactions AS t2
    ON t1.sender_account = t2.receiver_account
   AND t1.receiver_account = t2.sender_account
   -- Strict ordering makes each transaction pair appear only once.
   AND julianday(t2.transaction_timestamp) > julianday(t1.transaction_timestamp)
   AND julianday(t2.transaction_timestamp) <= julianday(t1.transaction_timestamp) + 1.0
   -- Inclusive boundary: exactly 10% is a qualifying match.
   AND (ABS(t2.amount - t1.amount) * 1.0) / NULLIF(t1.amount, 0) <= 0.10
ORDER BY t1.transaction_timestamp, t1.transaction_id, t2.transaction_id;
