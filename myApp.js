const { connection } = require("./connection.js");

const inquirer = require("inquirer");
const consoleT = require("console.table");

const C = require("./dbCreateFx");
const U = require("./dbUpdateFx");
const D = require("./dbDeleteFx");

// EMPLOYEE mgmt functions

// Checking if the Roles and Depts arrays are filled
const fillArrays = () => {
    if (deptsArray.length === 0) {
        U.currentDeptList();
        if (rolesArray.length === 0) {
            U.currentRoleList();
        }
    } else if (rolesArray.length === 0) {
        U.currentRoleList();
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
            C.createRecs();
        } else if (response.operation === "Update records") {
            U.updEmp();
        } else if (response.operation === "Remove records") {
            D.delRecs();
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

module.exports = {viewEmps}