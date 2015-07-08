CREATE TABLE Competitor
(
   ID int PRIMARY KEY,
   UserName varchar(256),
   LastSketchAcquired date,
   LastShardAcquired date,
   Wins int DEFAULT(0),
   Losses int DEFAULT(0)
);

SELECT *
FROM Competitor

INSERT INTO Competitor (ID, UserName, LastSketchAcquired, LastShardAcquired)
VALUES (1, 'jody', current_date, current_date)