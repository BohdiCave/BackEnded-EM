const { connection } = require("./connection.js");

module.exports = {

    // DELETE

    // General remove function 
    delRecs: function () {
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
    },

    // Remove an employee
    delEmp: function() {
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
    },

    delDept: function() {
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
    },

    delRole: function() {
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


}