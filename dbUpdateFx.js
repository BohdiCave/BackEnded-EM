const { connection } = require("./connection.js");

module.exports = {

    // UPDATE
    
    // Main update function
    updEmp: function() {
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
    },

    // Employee name
    updName: function(empID, firstName, lastName) {
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
    },

    // Employee Role
    updRole: function(empID) {
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
    },

    // Roles Array
    let: rolesArray = [],
    currentRoleList: function() {
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
    },

    // Department Array
    let: deptsArray = [],
    currentDeptList: function() {
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


}