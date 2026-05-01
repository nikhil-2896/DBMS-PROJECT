🌍 Disaster Management System (DBMS Project)

📌 Overview

The Disaster Management System is a database-driven application designed to efficiently manage and organize critical information during emergencies such as floods, earthquakes, and fires.

This system replaces traditional manual record-keeping with a centralized, structured, and reliable database, enabling faster decision-making, better coordination, and improved resource management.

🎯 Objectives
Design a structured database using ER Modeling
Convert ER model into a Relational Schema
Normalize the database up to 3NF/BCNF
Implement database using SQL (DDL & DML)
Develop PL/SQL components (procedures, triggers, functions, cursors)
Ensure data integrity, consistency, and security
Enable efficient tracking of:
Disasters
Victims
Resources
Shelters
Responders
🚨 Problem Statement

Disaster management involves handling large volumes of critical data. Existing systems:

Are manual and slow
Lack centralized storage
Cause data duplication & inconsistency
Do not support real-time tracking

This project provides a centralized DBMS solution to overcome these challenges.

⚙️ Features
Disaster Registration & Management
Victim Tracking & Assistance
Shelter Capacity & Occupancy Management
Resource Allocation & Monitoring
Responder Assignment
Automated Reports using SQL Queries
Trigger-based automatic updates (e.g., shelter occupancy)
Transaction handling (COMMIT / ROLLBACK)
👥 User Roles
🔑 Admin
Manage disaster records
Monitor victims and locations
Allocate resources
Generate reports
🚑 Responder / Authority Staff
Update victim assistance
Manage shelter occupancy
Track resources
View assigned disasters
🗂️ Database Design
📊 Entities
Disaster
Location
Victim
Shelter
Resource
Responder
Victim_Assistance
Resource_Alloc
Disaster_Location
🔗 Relationships
One disaster → many locations
One disaster → many victims
One disaster → many resources
One disaster → many responders
Shelter belongs to one location
🧱 Relational Schema (Simplified)
DISASTER(disaster_id, type, start_date, end_date, severity, description)

LOCATION(location_id, state, district, city)

DISASTER_LOCATION(disaster_id, location_id, impact_level)

VICTIM(victim_id, name, dob, gender, contact)

SHELTER(shelter_id, location_id, name, capacity, occupancy)

VICTIM_ASSISTANCE(assistance_id, victim_id, disaster_id, shelter_id, status)

RESOURCE(resource_id, name, category, unit_cost)

RESOURCE_ALLOC(alloc_id, disaster_id, resource_id, qty, status)

RESPONDER(responder_id, disaster_id, name, role, org)
🧮 Normalization
✅ 1NF: Atomic attributes, no repeating groups
✅ 2NF: No partial dependency
✅ 3NF: No transitive dependency

Ensures:

Reduced redundancy
Improved data consistency
💻 Technologies Used
Database: Oracle / MySQL
Tools:
Oracle SQL Developer
MySQL Workbench
Languages:
SQL (DDL, DML)
PL/SQL
