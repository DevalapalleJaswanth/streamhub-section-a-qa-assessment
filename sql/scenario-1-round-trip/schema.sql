-- SQLite Scenario 1: quick round-trip transfers / likely payment reversals

DROP TABLE IF EXISTS money_transactions;

CREATE TABLE money_transactions (
    transaction_id        INTEGER PRIMARY KEY,
    sender_account        TEXT NOT NULL,
    receiver_account      TEXT NOT NULL,
    amount                NUMERIC NOT NULL CHECK (amount > 0),
    transaction_timestamp TEXT NOT NULL,
    CONSTRAINT different_accounts CHECK (sender_account <> receiver_account)
);

CREATE INDEX money_transactions_route_time_idx
    ON money_transactions (sender_account, receiver_account, transaction_timestamp);
