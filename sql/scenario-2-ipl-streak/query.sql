-- SQLite Scenario 2: find players with at least three consecutive
-- qualifying (30+ run) appearances in season 2024.
--
-- Consecutive means consecutive appearances for a player, not consecutive
-- calendar dates. match_date plus performance_id provides deterministic order.

WITH season_appearances AS (
    SELECT
        performance_id,
        player_name,
        match_date,
        runs,
        ROW_NUMBER() OVER (
            PARTITION BY player_name
            ORDER BY match_date, performance_id
        ) AS appearance_number
    FROM player_performances
    WHERE season = 2024
), qualifying_appearances AS (
    SELECT
        performance_id,
        player_name,
        match_date,
        runs,
        appearance_number,
        ROW_NUMBER() OVER (
            PARTITION BY player_name
            ORDER BY appearance_number
        ) AS qualifying_number
    FROM season_appearances
    WHERE runs >= 30
), grouped_streaks AS (
    SELECT
        player_name,
        match_date,
        appearance_number - qualifying_number AS streak_group
    FROM qualifying_appearances
), streak_summary AS (
    SELECT
        player_name,
        MIN(match_date) AS streak_start_date,
        COUNT(*) AS streak_length
    FROM grouped_streaks
    GROUP BY player_name, streak_group
)
SELECT
    player_name,
    streak_start_date
FROM streak_summary
WHERE streak_length >= 3
ORDER BY streak_start_date, player_name;
