CREATE TABLE MinedResource
(
   MinedResourceID SERIAL PRIMARY KEY,
   CompetitorID int,
   MinedResourceTypeID int,
   Color int,
   Used bit DEFAULT 0::bit
);

DROP TABLE MinedResource

INSERT INTO MinedResource (CompetitorID, MinedResourceTypeID, Color) (
SELECT C.CompetitorID, 1, 3
FROM Competitor C
WHERE UserName = 'jody');

SELECT *
FROM MinedResource
