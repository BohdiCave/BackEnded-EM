DROP DATABASE IF EXISTS employee_mgmt_db;

CREATE DATABASE employee_mgmt_db;

USE employee_mgmt_db;

-- Table plans
CREATE TABLE employees (
  id int NOT NULL AUTO_INCREMENT,
  first_name varchar(50) NOT NULL,
  last_name varchar(50) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE role (
    id int NOT NULL AUTO_INCREMENT,
    title varchar(50) NOT NULL,
    salary decimal(10,2),
    PRIMARY KEY (id)
);

CREATE TABLE department (
    id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name varchar(50) NOT NULL
);

-- Inserting records.
INSERT INTO employees (first_name, last_name)
VALUES ("Petro", "Mohyla"), ("Ivan", "Fedoriv"), ("John", "Hughes");

INSERT INTO role (title, salary)
VALUES ("President", 100000), ("Printer", 70000), ("Visiting Professor", 50000);

INSERT INTO department (name) VALUES ("Administration"), ("Faculty");
