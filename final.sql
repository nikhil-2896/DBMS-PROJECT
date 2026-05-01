CREATE DATABASE disaster_management;
USE disaster_management;
CREATE TABLE disaster (
    disaster_id INT PRIMARY KEY,
    type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    severity VARCHAR(20),
    description VARCHAR(200)
);
CREATE TABLE location (
    location_id INT PRIMARY KEY,
    state VARCHAR(50),
    district VARCHAR(50),
    city VARCHAR(50),
    CONSTRAINT unique_location UNIQUE (state, district, city)
);
CREATE TABLE DISASTER_LOCATION (
    disaster_id INT,
    location_id INT,
    impact_level VARCHAR(20),
    PRIMARY KEY (disaster_id, location_id),
    FOREIGN KEY (disaster_id) REFERENCES DISASTER(disaster_id),
    FOREIGN KEY (location_id) REFERENCES LOCATION(location_id)
);
CREATE TABLE VICTIM (
    victim_id INT PRIMARY KEY,
    name VARCHAR(50),
    dob DATE,
    gender VARCHAR(10),
    contact VARCHAR(15)
);
CREATE TABLE SHELTER (
    shelter_id INT PRIMARY KEY,
    location_id INT,
    name VARCHAR(100),
    capacity INT,
    occupancy INT,
    FOREIGN KEY (location_id) REFERENCES LOCATION(location_id)
);

CREATE TABLE VICTIM_ASSISTANCE (
    assistance_id INT PRIMARY KEY,
    victim_id INT,
    disaster_id INT,
    shelter_id INT,
    status VARCHAR(50),
    FOREIGN KEY (victim_id) REFERENCES VICTIM(victim_id),
    FOREIGN KEY (disaster_id) REFERENCES DISASTER(disaster_id),
    FOREIGN KEY (shelter_id) REFERENCES SHELTER(shelter_id)
);

CREATE TABLE RESOURCE (
    resource_id INT PRIMARY KEY,
    name VARCHAR(50),
    category VARCHAR(50),
    unit_cost INT
);

CREATE TABLE RESOURCE_ALLOC (
    alloc_id INT PRIMARY KEY,
    disaster_id INT,
    resource_id INT,
    qty INT,
    status VARCHAR(50),
    FOREIGN KEY (disaster_id) REFERENCES DISASTER(disaster_id),
    FOREIGN KEY (resource_id) REFERENCES RESOURCE(resource_id)
);

CREATE TABLE RESPONDER (
    responder_id INT PRIMARY KEY,
    disaster_id INT,
    name VARCHAR(100),
    role VARCHAR(50),
    org VARCHAR(50),
    FOREIGN KEY (disaster_id) REFERENCES DISASTER(disaster_id)
);

INSERT INTO disaster VALUES 
(1, 'Flood', '2025-07-10', '2025-07-18', 'High', 'Severe flooding due to monsoon'),
(2, 'Earthquake', '2025-03-02', '2025-03-02', 'Medium', 'Moderate tremors'),
(3, 'Cyclone', '2025-10-05', '2025-10-09', 'High', 'Cyclone landfall'),
(4, 'Heatwave', '2025-05-01', '2025-05-20', 'Low', 'Extreme heat');


INSERT INTO LOCATION VALUES (101, 'Punjab', 'Patiala', 'Patiala');
INSERT INTO LOCATION VALUES (102, 'Delhi', 'New Delhi', 'Delhi');
INSERT INTO LOCATION VALUES (103, 'Maharashtra', 'Mumbai', 'Mumbai');
INSERT INTO LOCATION VALUES (104, 'Odisha', 'Puri', 'Puri');
INSERT INTO LOCATION VALUES (105, 'Rajasthan', 'Jaipur', 'Jaipur');
INSERT INTO LOCATION VALUES (106, 'Assam', 'Guwahati', 'Guwahati');

INSERT INTO victim VALUES 
(201, 'Rohit Kumar', '1995-06-15', 'Male', '9876543210'),
(202, 'Anjali Sharma', '2000-09-20', 'Female', '9123456780'),
(203, 'Suresh Patel', '1985-01-10', 'Male', '9988776655'),
(204, 'Neha Verma', '1998-11-05', 'Female', '9012345678'),
(205, 'Aman Singh', '2002-03-18', 'Male', '9090909090');

INSERT INTO RESOURCE VALUES (501, 'Food Packets', 'Food', 50);
INSERT INTO RESOURCE VALUES (502, 'Water Bottles', 'Water', 20);
INSERT INTO RESOURCE VALUES (503, 'Medical Kits', 'Medical', 200);
INSERT INTO RESOURCE VALUES (504, 'Blankets', 'Relief', 150);
INSERT INTO RESOURCE VALUES (505, 'Tents', 'Shelter', 500);

INSERT INTO SHELTER VALUES (301, 101, 'Patiala Relief Camp', 200, 150);
INSERT INTO SHELTER VALUES (302, 102, 'Delhi Emergency Shelter', 300, 210);
INSERT INTO SHELTER VALUES (303, 104, 'Puri Cyclone Shelter', 250, 200);
INSERT INTO SHELTER VALUES (304, 105, 'Jaipur Relief Center', 150, 80);


INSERT INTO DISASTER_LOCATION VALUES (1, 101, 'Severe');
INSERT INTO DISASTER_LOCATION VALUES (1, 106, 'Moderate');
INSERT INTO DISASTER_LOCATION VALUES (2, 102, 'Moderate');
INSERT INTO DISASTER_LOCATION VALUES (3, 104, 'Severe');
INSERT INTO DISASTER_LOCATION VALUES (4, 105, 'Mild');

INSERT INTO VICTIM_ASSISTANCE VALUES (401, 201, 1, 301, 'Rescued');
INSERT INTO VICTIM_ASSISTANCE VALUES (402, 202, 2, 302, 'Under Treatment');
INSERT INTO VICTIM_ASSISTANCE VALUES (403, 203, 3, 303, 'Rescued');
INSERT INTO VICTIM_ASSISTANCE VALUES (404, 204, 4, 304, 'Relocated');
INSERT INTO VICTIM_ASSISTANCE VALUES (405, 205, 1, 301, 'Rescued');

INSERT INTO RESOURCE_ALLOC VALUES (601, 1, 501, 500, 'Distributed');
INSERT INTO RESOURCE_ALLOC VALUES (602, 1, 502, 1000, 'Distributed');
INSERT INTO RESOURCE_ALLOC VALUES (603, 2, 503, 200, 'Pending');
INSERT INTO RESOURCE_ALLOC VALUES (604, 3, 505, 150, 'Distributed');
INSERT INTO RESOURCE_ALLOC VALUES (605, 4, 504, 300, 'Distributed');

INSERT INTO RESPONDER VALUES (701, 1, 'NDRF Team A', 'Rescue', 'NDRF');
INSERT INTO RESPONDER VALUES (702, 2, 'Delhi Police Unit', 'Security', 'Police');
INSERT INTO RESPONDER VALUES (703, 3, 'Coast Guard Team', 'Rescue', 'Coast Guard');
INSERT INTO RESPONDER VALUES (704, 4, 'Health Department Team', 'Medical', 'Govt Health');


SHOW TABLES;
SELECT * FROM disaster;
SELECT * FROM location;

-- BASIC QUERIES
-- VICTIM IN DATABASE

SELECT name, gender FROM VICTIM;

-- Shelters with capacity > 200
SELECT name, capacity 
FROM SHELTER
WHERE capacity > 200;

-- JOIN QUERIES
-- Disaster + Location affected
SELECT d.type, l.city, dl.impact_level
FROM DISASTER d
JOIN DISASTER_LOCATION dl ON d.disaster_id = dl.disaster_id
JOIN LOCATION l ON dl.location_id = l.location_id;

-- Victims with their disaster and shelter

SELECT v.name, d.type, s.name AS shelter, va.status
FROM VICTIM v
JOIN VICTIM_ASSISTANCE va ON v.victim_id = va.victim_id
JOIN DISASTER d ON va.disaster_id = d.disaster_id
JOIN SHELTER s ON va.shelter_id = s.shelter_id;

-- Resources allocated to each disaster
SELECT d.type, r.name, ra.qty
FROM DISASTER d
JOIN RESOURCE_ALLOC ra ON d.disaster_id = ra.disaster_id
JOIN RESOURCE r ON ra.resource_id = r.resource_id;

-- Aggregate Queries
-- Total victims per disaster
SELECT d.type, COUNT(*) AS total_victims
FROM DISASTER d
JOIN VICTIM_ASSISTANCE va ON d.disaster_id = va.disaster_id
GROUP BY d.type;

-- Total resources allocated per disaster
SELECT d.type, SUM(ra.qty) AS total_resources
FROM DISASTER d
JOIN RESOURCE_ALLOC ra ON d.disaster_id = ra.disaster_id
GROUP BY d.type;

-- Shelter occupancy status
SELECT name, capacity, occupancy,
(capacity - occupancy) AS available_space
FROM SHELTER;


-- FILTER

-- High severity disasters
SELECT * 
FROM DISASTER
WHERE severity = 'High';

-- Victims rescued
SELECT v.name, va.status
FROM VICTIM v
JOIN VICTIM_ASSISTANCE va ON v.victim_id = va.victim_id
WHERE va.status = 'Rescued';

-- SUB QUERIES
-- Disaster with maximum victims
SELECT type
FROM DISASTER
WHERE disaster_id = (
    SELECT disaster_id
    FROM VICTIM_ASSISTANCE
    GROUP BY disaster_id
    ORDER BY COUNT(*) DESC
    LIMIT 1
);
-- Shelters with highest occupancy
SELECT name
FROM SHELTER
WHERE occupancy = (SELECT MAX(occupancy) FROM SHELTER);

-- ADDITIONAL QUERIES

-- Responders per disaster
SELECT d.type, COUNT(r.responder_id) AS total_responders
FROM DISASTER d
LEFT JOIN RESPONDER r ON d.disaster_id = r.disaster_id
GROUP BY d.type;

-- Disaster affecting multiple locations
SELECT d.type
FROM DISASTER d
JOIN DISASTER_LOCATION dl ON d.disaster_id = dl.disaster_id
GROUP BY d.type
HAVING COUNT(dl.location_id) > 1;

-- Resources still pending
SELECT r.name, ra.status
FROM RESOURCE r
JOIN RESOURCE_ALLOC ra ON r.resource_id = ra.resource_id
WHERE ra.status = 'Pending';

-- Stored Procedures

DELIMITER //

CREATE PROCEDURE add_disaster (
    IN p_id INT,
    IN p_type VARCHAR(50),
    IN p_start DATE,
    IN p_end DATE,
    IN p_severity VARCHAR(20),
    IN p_desc VARCHAR(200)
)
BEGIN
    INSERT INTO disaster
    VALUES (p_id, p_type, p_start, p_end, p_severity, p_desc);

    SELECT 'Disaster inserted successfully' AS message;
END //

DELIMITER ;


-- Total Resources for a Disaster

DELIMITER //

CREATE FUNCTION total_resources(p_disaster_id INT)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE total INT;

    SELECT IFNULL(SUM(qty), 0)
    INTO total
    FROM resource_alloc
    WHERE disaster_id = p_disaster_id;

    RETURN total;
END //

DELIMITER ;

-- Available Shelter Capacity

DELIMITER //

CREATE FUNCTION available_capacity(p_shelter_id INT)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE cap INT;
    DECLARE occ INT;

    SELECT capacity, occupancy
    INTO cap, occ
    FROM shelter
    WHERE shelter_id = p_shelter_id;

    RETURN cap - occ;
END //

DELIMITER ;

-- trigger
DROP TRIGGER IF EXISTS update_occupancy;
DELIMITER //

CREATE TRIGGER update_occupancy
BEFORE INSERT ON victim_assistance
FOR EACH ROW
BEGIN
    DECLARE cap INT DEFAULT 0;
    DECLARE occ INT DEFAULT 0;

    -- fetch values safely
    SELECT capacity, occupancy
    INTO cap, occ
    FROM shelter
    WHERE shelter_id = NEW.shelter_id;

    -- if shelter not found
    IF cap IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid shelter_id';
    END IF;

    -- if full
    IF occ >= cap THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Shelter is full';
    END IF;

    -- update occupancy
    UPDATE shelter
    SET occupancy = occupancy + 1
    WHERE shelter_id = NEW.shelter_id;

END //

DELIMITER ;

-- Disaster summary report
DROP PROCEDURE IF EXISTS disaster_summary_cursor;
DELIMITER //

CREATE PROCEDURE disaster_summary_cursor()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE v_id INT;
    DECLARE v_type VARCHAR(50);
    DECLARE v_count INT;

    DECLARE disaster_cur CURSOR FOR
        SELECT disaster_id, type FROM disaster;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    -- now SQL statements
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_report (
        disaster_id INT,
        disaster_type VARCHAR(50),
        total_victims INT
    );

    DELETE FROM temp_report;

    OPEN disaster_cur;

    read_loop: LOOP
        FETCH disaster_cur INTO v_id, v_type;
        IF done THEN
            LEAVE read_loop;
        END IF;

        SELECT COUNT(*) INTO v_count
        FROM victim_assistance
        WHERE disaster_id = v_id;

        INSERT INTO temp_report
        VALUES (v_id, v_type, v_count);

    END LOOP;

    CLOSE disaster_cur;

    SELECT * FROM temp_report;

END //

DELIMITER ;
SET SQL_SAFE_UPDATES = 0;
CALL disaster_summary_cursor();


DELIMITER //

CREATE PROCEDURE safe_insert_resource (
    IN p_id INT,
    IN p_name VARCHAR(50),
    IN p_cat VARCHAR(50),
    IN p_cost INT
)
BEGIN
    -- handle duplicate primary key error
    DECLARE CONTINUE HANDLER FOR 1062
    BEGIN
        SELECT 'Duplicate resource ID' AS message;
    END;

    -- handle other errors
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        SELECT 'Some error occurred' AS message;
    END;

    INSERT INTO resource
    VALUES (p_id, p_name, p_cat, p_cost);

    SELECT 'Resource inserted successfully' AS message;

END //

DELIMITER ;

CALL safe_insert_resource(501, 'Food Packets', 'Food', 50);


-- transaction 
-- rollback
START TRANSACTION;

INSERT INTO victim VALUES (210, 'Test User', '2000-01-01', 'Male', '9999999999');

ROLLBACK;

SELECT * FROM victim WHERE victim_id = 210;

-- commit
START TRANSACTION;

INSERT INTO victim VALUES (210, 'Test User', '2000-01-01', 'Male', '9999999999');

COMMIT;

SELECT * FROM victim WHERE victim_id = 210;

-- victim assistance transaction
START TRANSACTION;
INSERT INTO VICTIM_ASSISTANCE 
VALUES (500, 201, 1, 301, 'Rescued');
-- If everything OK
COMMIT;
-- If error (like capacity exceeded)
-- ROLLBACK;

USE disaster_management;

DELETE FROM VICTIM_ASSISTANCE WHERE disaster_id IN (SELECT disaster_id FROM disaster WHERE type = 'u');
USE disaster_management;
SET SQL_SAFE_UPDATES = 0;
DELETE FROM disaster WHERE type = 'u';
SET SQL_SAFE_UPDATES = 1;


