const { connection } = require("./connection.js");

module.exports = {

    // CREATE
    
    // General create function
    createRecs: function() {
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
    },


    // New employee
    addEmp: function() {
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
    },

    // New department
    
    createDept: function() {
        let newDeptID, newDeptName;
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
    },

    // New role
    createRole: function() {
        let newRoleID, newRoleName, newSal, belong;
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


}