-- SQLite Scenario 2: IPL-style 2024 batting streaks.

DROP TABLE IF EXISTS player_performances;

CREATE TABLE player_performances (
    performance_id INTEGER PRIMARY KEY,
    player_name    TEXT NOT NULL,
    match_date     TEXT NOT NULL,
    opponent       TEXT NOT NULL,
    runs           INTEGER NOT NULL CHECK (runs >= 0),
    season         INTEGER NOT NULL
);

CREATE INDEX player_performances_player_date_idx
    ON player_performances (season, player_name, match_date, performance_id);
