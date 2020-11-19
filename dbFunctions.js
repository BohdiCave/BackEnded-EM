const inquirer = require("inquirer");
var mysql = require("mysql");
const cTable = require("console.table");
const { ifError } = require("assert");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "employee_mgmt_db"
});
  
connection.connect(function(err) {
    if (err) {
        console.error("error connecting: " + err.stack);
        return;
    }
    console.log("connected as id " + connection.threadId);
});

// EMPLOYEE mgmt functions

// Choice of the next task to complete
const next = () => {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "operation", 
            choices: [
                "Add an employee to the list",
                "Update an employee's information",
                "Remove an employee from the list"
            ]
        }
    ])
    .then(response => {
        if (response.operation === "Add an employee to the list") {
            addEmp();
        } else if (response.operation === "Update an employee's information") {
            updEmp();
        } else if (response.operation === "Remove an employee from the list") {
            delEmp();
        }
    });
}

// VIEW
const viewEmps = () => {
    connection.query("SELECT employees.id, first_name, last_name, title, salary, name FROM employees INNER JOIN roles ON employees.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id ORDER BY employees.id;", (err, result) => {
        if (err) throw err;
        console.table("BackEnded Employee MGMT \n Active Employees:", result);
        next();
    });
}

// CREATE
// New employee
const addEmp = () => {
    let newDeptId, newRoleId, newEmpId, newSalary;
    inquirer.prompt([
            {
                type: "list",
                message: "To which department would you like to add the new employee?",
                name: "new_dept",
                choices: [
                    "Administration",
                    "Faculty",
                    "Create new department"
                ]
            },
            {
                type: "list",
                message: "What is the new employee's role?",
                name: "new_role",
                choices: [
                    "President",
                    "Visiting Professor",
                    "Printer",
                    "Create new role"
                ]
            },
            {
                type: "input",
                message: "What is the new employee's first name?",
                name: "new_firstname"
            }, 
            {
                type: "input",
                message: "What is the new employee's last name?",
                name: "new_lastname"
            }
        ])
        .then(response => {
            if(response.new_dept === "Create new department") {
                newDeptId = createDept();
            } else if (response.new_dept === "Administration") {
                newDeptId = 1;
            } else if (response.new_dept === "Faculty") {
                newDeptId = 2;
            }

            if (response.new_role === "Create new role") {
                newRoleId = createRole();
            } else if(response.new_role === "Visiting Professor") {
                newRoleId = 3;
                newSalary = 50000;
            } else if (response.new_role === "Printer") {
                newRoleId = 2;
                newSalary = 70000;
            } else if (response.new_role === "President") {
                console.log("You think you're President? There can be only one! Begone!");
                addEmp();
            }

            connection.query ("INSERT INTO employees (first_name, last_name, role_id) VALUES (?, ?, ?);", [response.new_firstname, response.new_lastname, newRoleId], (err, result) => {
                if (err) throw err;
                newEmpId = result.insertId;
            });
            console.table("New Employee", [
                {
                    Employee_ID: newEmpId,
                    Name: `${response.new_firstname} ${response.new_lastname}`,
                    Title: response.new_role,
                    Salary: newSalary,
                    Department: response.new_dept
                }
            ]);
            viewEmps();
        });  
}

// New department
const createDept = () => {
    let newDeptID;
    inquirer
        .prompt([
            {
                type: "input",
                message: "Please enter the name of the department you need to create",
                name: "create_dept"
            }
        ])
        .then(response => {
            connection.query(
                "INSERT INTO departments (name) VALUES (?);", [response.create_dept],
                (err, result) => {
                    if(err) throw err;
                    if (affectedRows === 0) throw err;
                    else {
                        console.log(result.affectedRows + "new department created with ID " + result.insertID);
                        newDeptID = result.insertID;
                    };
                }
            );
            return newDeptID;
        });
}

// New role
const createRole = () => {
    let newRoleID, deptID;
    inquirer
        .prompt([
            {
                type: "input",
                message: "Please enter the new title to create",
                name: "create_role"
            },
            {
                type: "input",
                message: "Please enter the salary associated with the new title",
                name: "create_salary"
            },
            {
                type: "list",
                message: "To which department does the new position belong?",
                name: "belong_dept",
                choices: [
                    "Administration",
                    "Faculty",
                    "Create a new department"
                ]
            }
        ])
        .then(response => {
            if (response.belong_dept === "Administration") {
                deptID = 1;
            } else if (response.belong_dept === "Faculty") {
                deptID = 2;
            } else if (response.belong_dept === "Create a new department") {
                deptID = createDept();                 
            }

            connection.query(
                "INSERT INTO roles (title, salary, department_id) VALUES (?,?,?);", 
                [response.create_role, response.create_salary, deptID],
                (err, result) => {
                    if(err) throw err;
                    if(result.affectedRows === 0) throw err;
                    else {
                        console.log(result.affectedRows + "new title created with ID " + result.insertID);
                        newRoleID = result.insertID;
                    };
                }
            );
            return newRoleID;
        });
}

// UPDATE
// Employee name
const updName = (empID, firstName, lastName) => {
    connection.query(
        "UPDATE employees SET ? WHERE ?;",
        [
            { 
                first_name: firstName, 
                last_name: lastName
            }, 
            {
                id: empID
            }
        ],
        (err, result) => {
            if(err) throw err;
            if(result.changedRows === 0) throw err;
            else {
                console.log("Name updated for employee " + empID);
            };
        }
    );
}

// Employee Role
const updRole = empID => {
  let newRoleID;
  inquirer
    .prompt([
        {
            type: "list",
            message: "Please select the new title from the list:",
            name: "new_role",
            choices: [
                "Visiting Professor",
                "Printer",
                "Create a new title"
            ]
        }
    ])
    .then(response => {
        if (response.new_role === "Create a new title") {
            let newRoleID = createRole();
        } else if (response.new_role === "Visiting Professor") {
            newRoleID = 3;
        } else if (response.new_role === "Printer") {
            newRoleID = 2;
        }
        
        connection.query(
            "UPDATE employees SET ? WHERE ?",
            [
                {
                    role_id: newRoleID
                },
                {
                    id: empID
                }
            ],
            (err, result) => {
                if(err) throw err;
                if(result.changedRows === 0) throw err;
                else {
                    console.log("Role updated for employee " + empID);
                };
            }
        );

        viewEmps();
    });
}

// Main update function
const updEmp = () => {
    let empID;
    inquirer
        .prompt([
            {
                type: "input",
                message: "Please enter the ID of the employee whose information you need to update",
                name: "emp_id"
            }
        ])
        .then(response => {
            empID = response.emp_id;
            inquirer
                .prompt([
                    {
                        type: "input",
                        message: "Do you want to change either the first or the last name? Y/N",
                        name: "name_yorn"                        
                    }
                ])
                .then(response => {
                    let nameYorN = response.name_yorn.toLowerCase();
                    if (nameYorN === "y" || nameYorN=== "yes") {
                        inquirer
                            .prompt([
                                {
                                    type: "input",
                                    message: "Please enter the first name",
                                    name: "new_first"
                                },
                                {
                                    type: "input",
                                    message: "Please enter the last name",
                                    name: "new_last"
                                }
                            ])
                            .then(response => {
                                updName(empID, response.new_first, response.new_last); 
                                viewEmps(); 
                            });
                    } else {
                        inquirer
                            .prompt([
                                {
                                    type: "input",
                                    message: "Do you want to update the employee's role? Y/N",
                                    name: "role_yorn"
                                }
                            ])
                            .then(response => {
                                let roleYorN = response.role_yorn.toLowerCase();
                                if (roleYorN === "y" || roleYorN === "yes") {
                                    updRole(empID);
                                } else {
                                    console.log("Looks like you don't need to update any information. I'm returning you to the main menu.");
                                    viewEmps();
                                }
                            });
                    }
                });   
        });
}

// DELETE
const delEmp = () => {
    inquirer
        .prompt([
            {
                type: "input",
                message: "Please enter the ID of the employee whose information you need to remove",
                name: "emp_id"
            }
        ])
        .then(response => {
            connection.query("DELETE FROM employees WHERE id = ?;", [response.emp_id], (err, result) => {
                if (err) throw err;
                else if (result.affectedRows === 0) throw err;
                else {
                    console.log("Removed " + result.affectedRows + " employee with ID " + response.emp_id);
                }
                viewEmps();
            });
        });
}

module.exports = {viewEmps, next, addEmp, createDept, createRole, updRole, updName, updEmp, delEmp};
