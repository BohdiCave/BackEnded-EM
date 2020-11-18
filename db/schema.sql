DROP DATABASE IF EXISTS employee_mgmt_db;

CREATE DATABASE employee_mgmt_db;

USE employee_mgmt_db;

-- Table plans
CREATE TABLE departments (
    id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name varchar(50) NOT NULL
);

CREATE TABLE roles (
    id int NOT NULL AUTO_INCREMENT,
    title varchar(50) NOT NULL,
    salary decimal(10,2),
    department_id int,
    FOREIGN KEY (department_id) REFERENCES departments (id),
    PRIMARY KEY (id)
);

CREATE TABLE employees (
  id int NOT NULL AUTO_INCREMENT,
  first_name varchar(50) NOT NULL,
  last_name varchar(50) NOT NULL,
  role_id int,
  FOREIGN KEY (role_id) REFERENCES roles (id),
  PRIMARY KEY (id)
);