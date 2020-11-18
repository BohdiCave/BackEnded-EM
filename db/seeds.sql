-- Inserting records.
INSERT INTO departments (name) VALUES ("Administration"), ("Faculty");

INSERT INTO roles (title, salary, department_id)
VALUES ("President", 100000, 1), ("Printer", 70000, 1), ("Visiting Professor", 50000, 2);

INSERT INTO employees (first_name, last_name, role_id)
VALUES ("Petro", "Mohyla", 1), ("Ivan", "Fedoriv", 2), ("John", "Hughes", 3);