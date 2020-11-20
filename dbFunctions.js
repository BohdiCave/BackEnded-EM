const inquirer = require("inquirer");
const mysql = require("mysql");
const consoleT = require("console.table");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "employee_mgmt_db"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log(" Connected as id " + connection.threadId);
});

// EMPLOYEE mgmt functions

// Checking if the Roles and Depts arrays are filled
const fillArrays = () => {
    if (deptsArray.length === 0) {
        currentDeptList();
        if (rolesArray.length === 0) {
            currentRoleList();
        }
    } else if (rolesArray.length === 0) {
        currentRoleList();
    }
}

// Choice of the next task to complete
const next = () => {
    fillArrays();
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "operation", 
            choices: [
                "View records",
                "Create records",
                "Update records",
                "Remove records"
            ]
        }
    ])
    .then(response => {
        if (response.operation === "View records") {
            viewRecs();
        } else if (response.operation === "Create records") {
            createRecs();
        } else if (response.operation === "Update records") {
            updEmp();
        } else if (response.operation === "Remove records") {
            delRecs();
        }
    });
}

// VIEW

// General view function
const viewRecs = () => {
    inquirer
        .prompt([
            {
                type: "list",
                message: "What would you like to view?",
                name: "views",
                choices: [
                    "Employees",
                    "Existing employee roles",
                    "Existing departments"
                ]
            }
        ])
        .then(response => {
           if (response.views === "Employees") {
               viewEmps();
           } else if (response.views === "Existing employee roles") {
               viewRoles();
           } else if (response.views === "Existing departments") {
               viewDepts();
           }
        });
}

// Employee list
const viewEmps = () => {
    connection.query("SELECT employees.id, first_name, last_name, title, salary, name FROM employees INNER JOIN roles ON employees.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id ORDER BY employees.id;", (err, result) => {
        if (err) throw err;
        console.table("\n\r ====> BACKENDED EMPLOYEE MGMT <=== \n ------> Active Employees: <------", result);
        next();
    });
}   

// Role list
const viewRoles = () => {
    connection.query("SELECT roles.id, title, salary, name FROM roles INNER JOIN departments ON department_id = departments.id;", (err, result) => {
        if (err) throw err;
        console.table("\n\r ====> BACKENDED EMPLOYEE MGMT <=== \n ------> Existing Employee Roles: <------", result);
        next();
    });
}

// Department list
const viewDepts = () => {
    connection.query("SELECT * FROM departments;", (err, result) => {
        if (err) throw err;
        console.table("\n\r ====> BACKENDED EMPLOYEE MGMT <==== \n ------> Existing Departments: <------", result);
        next();
    })
}

// CREATE
// General create function
const createRecs = () => {
    inquirer
        .prompt([
            {
                type: "list",
                message: "Which records do you need to create?",
                name: "creations",
                choices: [
                    "Add an employee",
                    "Add an employee role",
                    "Add a department"
                ]
            }
        ])
        .then(response => {
            if (response.creations === "Add an employee") {
                addEmp();
            } else if (response.creations === "Add an employee role") {
                createRole();
            } else if (response.creations === "Add a department") {
                createDept();
            }
        });
}


// New employee
const addEmp = () => {
    let newRID, newEID, newSalary;
    inquirer.prompt([
            {
                type: "list",
                message: "To which department would you like to add the new employee?",
                name: "new_dept",
                choices: deptsArray
            },
            {
                type: "list",
                message: "What is the new employee's role?",
                name: "new_role",
                choices: rolesArray
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
            let newDpt = response.new_dept;
            let newRl = response.new_role;
            let newFN = response.new_firstname;
            let newLN = response.new_lastname;
            if (newRl === "President") {
                console.log("You think you're President? There can be only one! Begone!");
                next();
            } else {
                if (newRl === "Visiting Professor") {
                    newRID = 3;
                    newSalary = 50000;
                } else if (newRl === "Printer") {
                    newRID = 2;
                    newSalary = 70000;
                }

                connection.query ("INSERT INTO employees (first_name, last_name, role_id) VALUES (?, ?, ?);", [newFN, newLN, newRID], (err, result) => {
                    if (err) throw err;
                    newEID = result.insertId;
                });

                console.table("New Employee", [
                    {
                        Employee_ID: newEID,
                        Name: `${newFN} ${newLN}`,
                        Title: newRl,
                        Salary: newSalary,
                        Department: newDpt
                    }
                ]);
                viewEmps();
            }        
        });  
}

// New department
let newDeptID, newDeptName;
const createDept = () => {
    inquirer
        .prompt([
            {
                type: "input",
                message: "Please enter the name of the department you need to create",
                name: "create_dept"
            }
        ])
        .then(response => {
            newDeptName = response.create_dept;
            connection.query(
                "INSERT INTO departments (name) VALUES (?);", [newDeptName],
                (err, result) => {
                    if(err) throw err;
                    if (result.affectedRows === 0) throw err;
                    else {
                        newDeptID = result.insertId;
                        console.log(result.affectedRows + " new department created: " + newDeptName + ", with ID " + newDeptID);
                        currentDeptList();
                        next();
                    };
                }
            );
        });
}

// New role
let newRoleID, newRoleName, newSal;
const createRole = () => {
    let belong;
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
                choices: deptsArray
            }
        ])
        .then(response => {
            newSal = response.create_salary;
            newRoleName = response.create_role;
            belong = response.belong_dept;
            if (belong === "Administration") {
                connection.query("INSERT INTO roles (title, salary, department_id) VALUES (?,?,?);", 
                    [newRoleName, newSal, 1],
                    (err, result) => {
                        if(err) throw err;
                        if(result.affectedRows === 0) throw err;
                        else {
                            newRoleID = result.insertId;
                            console.log("\n\r" + result.affectedRows + " new title created: " + newRoleName + ", with ID " + newRoleID + " and salary " + newSal);
                            currentRoleList();
                            next();
                        };
                    }
                );
            } else if (belong === "Faculty") {
                connection.query("INSERT INTO roles (title, salary, department_id) VALUES (?,?,?);", 
                    [newRoleName, newSal, 2],
                    (err, result) => {
                        if(err) throw err;
                        if(result.affectedRows === 0) throw err;
                        else {
                            newRoleID = result.insertId;
                            console.log("\n\r" + result.affectedRows + " new title created: " + newRoleName + ", with ID " + newRoleID + " and salary " + newSal);
                            currentRoleList();
                            next();
                        };
                    }
                );            
            } else {
                console.log("Unknown department - apologies for the inconvenience. Please return to this task later, when the records have been reviewed and fully updated.");
                next();
            }           
        });
}

// UPDATE
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
                        type: "confirm",
                        message: "Do you want to change either the first or the last name?",
                        name: "name_yorn"                        
                    }
                ])
                .then(response => {
                    if (response.name_yorn) {
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
                                inquirer.prompt([
                                    {
                                        type: "confirm", 
                                        message: "Do you want to update the employee's role as well?", name: "role_too_yorn"
                                    }
                                ]).then(response => {
                                    if (response.role_too_yorn) {
                                        updRole(empID);
                                    } else {
                                        next();
                                    }
                                }) 
                            });
                    } else {
                        inquirer
                            .prompt([
                                {
                                    type: "confirm",
                                    message: "Do you want to update the employee's role?",
                                    name: "role_yorn"
                                }
                            ])
                            .then(response => {
                                if (response.role_yorn) {
                                    updRole(empID);
                                } else {
                                    console.log("Looks like you don't need to update any information. You're returning to the main menu.");
                                    next();
                                }
                            });
                    }
                });   
        });
}

// Employee name
const updName = (empID, firstName, lastName) => {
    connection.query(
        "UPDATE employees SET ? WHERE ?;",
        [{ 
            first_name: firstName, 
            last_name: lastName
        }, 
        {
            id: empID
        }],
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
  inquirer
    .prompt([
        {
            type: "list",
            message: "Please select the new title from the list:",
            name: "new_role",
            choices: rolesArray
        }
    ])
    .then(response => {
        if (response.new_role === "Visiting Professor") {
            connection.query(
                "UPDATE employees SET ? WHERE ?",
                [{ role_id: 3 }, { id: empID }],
                (err, result) => {
                    if (err) throw err;
                    if (result.changedRows === 0) throw err;
                    else { console.log("Role updated for employee " + empID); };
                }
            );
            next();    
        } else if (response.new_role === "Printer") {
            connection.query(
                "UPDATE employees SET ? WHERE ?",
                [{ role_id: 2 }, { id: empID }],
                (err, result) => {
                    if (err) throw err;
                    if (result.changedRows === 0) throw err;
                    else { console.log("Role updated for employee " + empID); };
                }
            );
            next();
        } else {
            connection.query(
                "SELECT roles.id FROM roles WHERE title = ?;", 
                [response.new_role], 
                (err, result) => { if(err) throw err;
                    else { 
                        console.log(result);
                        connection.query(
                            "UPDATE employees SET ? WHERE ?", 
                            [{ role_id: result[0].id }, { id: empID }],
                            (err, result) => {
                                if(err) throw err;
                                if(result.changedRows === 0) throw err;
                                else { console.log("Role updated for employee " + empID); };
                            }
                        );
                        next();
                    }
                }
            );
        }  
    });
}

// Roles Array
let rolesArray = [];
const currentRoleList = () => {
    rolesArray.length = 0;
    connection.query("SELECT title FROM roles;", (err, result) => { 
        if (err) {
            throw err;
        } else {
            for (let i = 0; i < result.length; i++) {
                rolesArray.push(result[i].title);
            }
            return;    
        }
    });
}

// Department Array
let deptsArray = [];
const currentDeptList = () => {
    deptsArray.length = 0;
    connection.query("SELECT name FROM departments;", (err, result) => { 
        if(err) throw err;
        else {
            for (let j = 0; j < result.length; j++) {
                deptsArray.push(result[j].name);
            }
            return;
        }
    });
}

// DELETE

// General remove function 
const delRecs = () => {
    inquirer
        .prompt([
            {
                type: "list",
                message: "Which records do you need to remove?",
                name: "deletions",
                choices: [
                    "Remove an employee",
                    "Remove an employee role",
                    "Remove a department"
                ]
            }
        ]).then(response => {
            if (response.deletions === "Remove an employee") {
                delEmp();
            } else if (response.deletions === "Remove an employee role") {
                delRole();
            } else if (response.deletions === "Remove a department") {
                delDept();
            }
        });
}

// Remove an employee
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

const delDept = () => {
    connection.query("SELECT * FROM departments;", (err, result) => { 
        if (err) throw err; 
        else {console.table("Existing Departments", result);}
    });
    inquirer
        .prompt([
            {
                type: "input",
                message: "Please enter the ID of the record you wish to remove",
                name: "removal_deptID"
            }
        ]).then(response => {
            connection.query("DELETE FROM departments WHERE id = ?;", [response.removal_deptID], (err, result) => { 
                if(err) throw err; 
                else if (result.affectedRows === 0) throw err; 
                else { 
                    console.log("Removed " + result.affectedRows + " department with ID " + response.removal_deptID);
                }
                viewDepts();    
            });
        });
}

const delRole = () => {
    connection.query("SELECT * from roles;", (err, result) => { 
        if (err) throw err; 
        else {
            console.table("Existing Employee Roles", result); 
            inquirer.prompt([
                {
                    type: "input",
                    message: "Please enter the ID of the record you wish to remove",
                    name: "removal_roleID"
                }
            ])
            .then (response => {
                connection.query(
                    "DELETE FROM roles WHERE id = ?;", 
                    [response.removal_roleID], 
                    (err, result) => {
                        if (err) throw err;
                        else if (result.affectedRows === 0) throw err;
                        else {
                            console.log("Removed " + result.affectedRows + " employee role with ID " + response.removal_roleID);
                        }
                        viewRoles();
                    }
                );
            });
        }
    });
}

module.exports = {viewEmps}