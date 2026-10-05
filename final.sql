DROP DATABASE IF EXISTS disaster_management;
CREATE DATABASE disaster_management;
USE disaster_management;

CREATE TABLE disaster (
    disaster_id INT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    severity VARCHAR(20) NOT NULL,
    description VARCHAR(200) NULL
);

CREATE TABLE location (
    location_id INT PRIMARY KEY,
    state VARCHAR(50),
    district VARCHAR(50),
    city VARCHAR(50),
    CONSTRAINT unique_location UNIQUE (state, district, city)
);

CREATE TABLE disaster_location (
    disaster_id INT,
    location_id INT,
    impact_level VARCHAR(20),
    PRIMARY KEY (disaster_id, location_id),
    FOREIGN KEY (disaster_id) REFERENCES disaster(disaster_id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES location(location_id) ON DELETE CASCADE
);

CREATE TABLE victim (
    victim_id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    dob DATE NULL,
    gender VARCHAR(10) NULL,
    contact VARCHAR(15) NULL
);

CREATE TABLE shelter (
    shelter_id INT PRIMARY KEY,
    location_id INT NULL,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL DEFAULT 0,
    occupancy INT NOT NULL DEFAULT 0,
    FOREIGN KEY (location_id) REFERENCES location(location_id) ON DELETE SET NULL
);

CREATE TABLE victim_assistance (
    assistance_id INT PRIMARY KEY,
    victim_id INT NOT NULL,
    disaster_id INT NOT NULL,
    shelter_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Assigned',
    FOREIGN KEY (victim_id) REFERENCES victim(victim_id) ON DELETE CASCADE,
    FOREIGN KEY (disaster_id) REFERENCES disaster(disaster_id) ON DELETE CASCADE,
    FOREIGN KEY (shelter_id) REFERENCES shelter(shelter_id) ON DELETE CASCADE
);

CREATE TABLE resource (
    resource_id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit_cost INT NOT NULL DEFAULT 0
);

CREATE TABLE resource_alloc (
    alloc_id INT PRIMARY KEY,
    disaster_id INT,
    resource_id INT,
    qty INT NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Pending',
    FOREIGN KEY (disaster_id) REFERENCES disaster(disaster_id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resource(resource_id) ON DELETE CASCADE
);

CREATE TABLE responder (
    responder_id INT PRIMARY KEY,
    disaster_id INT,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50),
    org VARCHAR(50),
    FOREIGN KEY (disaster_id) REFERENCES disaster(disaster_id) ON DELETE CASCADE
);

-- ================= SEED DATA =================
INSERT INTO disaster (disaster_id, type, start_date, end_date, severity, description) VALUES 
(1, 'Flood', '2025-07-10', '2025-07-18', 'High', 'Severe flooding due to monsoon'),
(2, 'Earthquake', '2025-03-02', '2025-03-02', 'Medium', 'Moderate tremors'),
(3, 'Cyclone', '2025-10-05', '2025-10-09', 'High', 'Cyclone landfall'),
(4, 'Heatwave', '2025-05-01', '2025-05-20', 'Low', 'Extreme heat');

INSERT INTO location (location_id, state, district, city) VALUES 
(101, 'Punjab', 'Patiala', 'Patiala'),
(102, 'Delhi', 'New Delhi', 'Delhi'),
(103, 'Maharashtra', 'Mumbai', 'Mumbai'),
(104, 'Odisha', 'Puri', 'Puri'),
(105, 'Rajasthan', 'Jaipur', 'Jaipur'),
(106, 'Assam', 'Guwahati', 'Guwahati');

INSERT INTO victim (victim_id, name, dob, gender, contact) VALUES 
(201, 'Rohit Kumar', '1995-06-15', 'Male', '9876543210'),
(202, 'Anjali Sharma', '2000-09-20', 'Female', '9123456780'),
(203, 'Suresh Patel', '1985-01-10', 'Male', '9988776655'),
(204, 'Neha Verma', '1998-11-05', 'Female', '9012345678'),
(205, 'Aman Singh', '2002-03-18', 'Male', '9090909090');

INSERT INTO shelter (shelter_id, location_id, name, capacity, occupancy) VALUES 
(301, 101, 'Patiala Relief Camp', 200, 150),
(302, 102, 'Delhi Emergency Shelter', 300, 210),
(303, 104, 'Puri Cyclone Shelter', 250, 200),
(304, 105, 'Jaipur Relief Center', 150, 80);

INSERT INTO disaster_location (disaster_id, location_id, impact_level) VALUES 
(1, 101, 'Severe'),
(1, 106, 'Moderate'),
(2, 102, 'Moderate'),
(3, 104, 'Severe'),
(4, 105, 'Mild');

INSERT INTO victim_assistance (assistance_id, victim_id, disaster_id, shelter_id, status) VALUES 
(401, 201, 1, 301, 'Rescued'),
(402, 202, 2, 302, 'Under Treatment'),
(403, 203, 3, 303, 'Rescued'),
(404, 204, 4, 304, 'Relocated'),
(405, 205, 1, 301, 'Rescued');

INSERT INTO resource (resource_id, name, category, unit_cost) VALUES 
(501, 'Food Packets', 'Food', 50),
(502, 'Water Bottles', 'Water', 20),
(503, 'Medical Kits', 'Medical', 200),
(504, 'Blankets', 'Relief', 150),
(505, 'Tents', 'Shelter', 500);

INSERT INTO resource_alloc (alloc_id, disaster_id, resource_id, qty, status) VALUES 
(601, 1, 501, 500, 'Distributed'),
(602, 1, 502, 1000, 'Distributed'),
(603, 2, 503, 200, 'Pending'),
(604, 3, 505, 150, 'Distributed'),
(605, 4, 504, 300, 'Distributed');

INSERT INTO responder (responder_id, disaster_id, name, role, org) VALUES 
(701, 1, 'NDRF Team A', 'Rescue', 'NDRF'),
(702, 2, 'Delhi Police Unit', 'Security', 'Police'),
(703, 3, 'Coast Guard Team', 'Rescue', 'Coast Guard'),
(704, 4, 'Health Department Team', 'Medical', 'Govt Health');

-- ================= TRIGGERS =================
DROP TRIGGER IF EXISTS trg_check_shelter_capacity;
DROP TRIGGER IF EXISTS trg_increment_shelter_occupancy;
DROP TRIGGER IF EXISTS trg_decrement_shelter_occupancy;

DELIMITER //

CREATE TRIGGER trg_check_shelter_capacity
BEFORE INSERT ON victim_assistance
FOR EACH ROW
BEGIN
    DECLARE cur_cap INT;
    DECLARE cur_occ INT;

    SELECT capacity, occupancy INTO cur_cap, cur_occ
    FROM shelter
    WHERE shelter_id = NEW.shelter_id;

    IF cur_cap IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid shelter_id';
    END IF;

    IF cur_occ >= cur_cap THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Shelter capacity exceeded. Cannot assign victim.';
    END IF;
END //

CREATE TRIGGER trg_increment_shelter_occupancy
AFTER INSERT ON victim_assistance
FOR EACH ROW
BEGIN
    UPDATE shelter
    SET occupancy = occupancy + 1
    WHERE shelter_id = NEW.shelter_id;
END //

CREATE TRIGGER trg_decrement_shelter_occupancy
AFTER DELETE ON victim_assistance
FOR EACH ROW
BEGIN
    UPDATE shelter
    SET occupancy = GREATEST(occupancy - 1, 0)
    WHERE shelter_id = OLD.shelter_id;
END //

DELIMITER ;