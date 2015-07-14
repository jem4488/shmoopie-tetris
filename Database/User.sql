CREATE TABLE Competitor
(
   CompetitorID int IDENTITY PRIMARY KEY,
   UserName varchar(256),
   LastSketchAcquired date,
   LastShardAcquired date,
   Wins int DEFAULT(0),
   Losses int DEFAULT(0)
);

DROP TABLE Competitor

SELECT *
FROM Competitor

INSERT INTO Competitor (UserName, LastSketchAcquired, LastShardAcquired)
VALUES ('jody', SYSDATETIME(), SYSDATETIME())