-- SQLite seed data for Scenario 2.
-- Match dates are ISO-8601 dates. Each row represents one player's appearance.

INSERT INTO player_performances (
    performance_id,
    player_name,
    match_date,
    opponent,
    runs,
    season
)
VALUES
    -- Ruturaj Gaikwad: four consecutive qualifying appearances, then a break.
    (2001, 'Ruturaj Gaikwad', '2024-03-22', 'RCB', 40, 2024),
    (2002, 'Ruturaj Gaikwad', '2024-03-27', 'DC', 35, 2024),
    (2003, 'Ruturaj Gaikwad', '2024-04-01', 'SRH', 50, 2024),
    (2004, 'Ruturaj Gaikwad', '2024-04-08', 'KKR', 32, 2024),
    (2005, 'Ruturaj Gaikwad', '2024-04-14', 'MI', 10, 2024),

    -- Virat Kohli: a qualifying three-match streak, then a below-threshold appearance.
    (2010, 'Virat Kohli', '2024-03-22', 'PBKS', 45, 2024),
    (2011, 'Virat Kohli', '2024-03-27', 'GT', 38, 2024),
    (2012, 'Virat Kohli', '2024-04-01', 'LSG', 51, 2024),
    (2013, 'Virat Kohli', '2024-04-08', 'RR', 29, 2024),
    (2014, 'Virat Kohli', '2024-04-14', 'MI', 42, 2024),
    -- This prior-season row must be ignored by the 2024 filter.
    (2015, 'Virat Kohli', '2023-05-21', 'GT', 99, 2023),

    -- Shubman Gill: 40, 35, 10, 45, 50, 60; only the second group qualifies.
    (2020, 'Shubman Gill', '2024-03-23', 'MI', 40, 2024),
    (2021, 'Shubman Gill', '2024-03-29', 'SRH', 35, 2024),
    (2022, 'Shubman Gill', '2024-04-05', 'CSK', 10, 2024),
    (2023, 'Shubman Gill', '2024-04-12', 'RR', 45, 2024),
    (2024, 'Shubman Gill', '2024-04-19', 'DC', 50, 2024),
    (2025, 'Shubman Gill', '2024-04-26', 'KKR', 60, 2024),

    -- Rishabh Pant: four qualifying appearances; the result must contain one
    -- four-match streak rather than overlapping three-match streaks.
    (2030, 'Rishabh Pant', '2024-05-01', 'LSG', 35, 2024),
    (2031, 'Rishabh Pant', '2024-05-07', 'GT', 40, 2024),
    (2032, 'Rishabh Pant', '2024-05-13', 'SRH', 45, 2024),
    (2033, 'Rishabh Pant', '2024-05-20', 'MI', 50, 2024),

    -- Suryakumar Yadav: qualifying scores are separated by below-threshold
    -- appearances, so no uninterrupted streak reaches three.
    (2040, 'Suryakumar Yadav', '2024-03-22', 'CSK', 34, 2024),
    (2041, 'Suryakumar Yadav', '2024-03-27', 'RCB', 12, 2024),
    (2042, 'Suryakumar Yadav', '2024-04-01', 'DC', 45, 2024),
    (2043, 'Suryakumar Yadav', '2024-04-08', 'KKR', 8, 2024),
    (2044, 'Suryakumar Yadav', '2024-04-14', 'RR', 50, 2024),

    -- Jasprit Bumrah: exactly two consecutive qualifying appearances.
    (2050, 'Jasprit Bumrah', '2024-03-23', 'DC', 31, 2024),
    (2051, 'Jasprit Bumrah', '2024-03-29', 'GT', 33, 2024),
    (2052, 'Jasprit Bumrah', '2024-04-05', 'RCB', 14, 2024),
    (2053, 'Jasprit Bumrah', '2024-04-12', 'PBKS', 40, 2024),

    -- KL Rahul: several non-consecutive qualifying scores, but no group of three.
    (2060, 'KL Rahul', '2024-03-24', 'RR', 38, 2024),
    (2061, 'KL Rahul', '2024-03-30', 'CSK', 30, 2024),
    (2062, 'KL Rahul', '2024-04-06', 'MI', 11, 2024),
    (2063, 'KL Rahul', '2024-04-13', 'RCB', 31, 2024),
    (2064, 'KL Rahul', '2024-04-20', 'GT', 12, 2024),
    (2065, 'KL Rahul', '2024-04-27', 'DC', 40, 2024);
