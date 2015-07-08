CREATE TABLE RobotTypeLib
(
   RobotTypeID int PRIMARY KEY,
   Name varchar(256) UNIQUE
);

INSERT INTO RobotTypeLib(RobotTypeID, Name)
VALUES (1, 'Gladiator'),
 (2, 'Samuri'),
 (3, 'Sentinel'),
 (4, 'Valkerie');

SELECT *
FROM RobotTypeLib