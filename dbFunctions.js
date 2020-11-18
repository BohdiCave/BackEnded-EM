const inquirer = require("inquirer");
var mysql = require("mysql");
const cTable = require("console.table");

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

function viewEmps() {
    connection.query("SELECT employees.id, first_name, last_name, title, salary, name FROM employees INNER JOIN roles ON employees.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id;", (err, result) => {
        if (err) throw err;
        console.table("Active Employees:", result);
        next();
    });
}

function next() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "operation", 
            choices: [
                "Add an employee to the list",
                "Remove an employee from the list",
                "Update an employee's information"
            ]
        }
    ])
    .then(response => {
        if (response.operation === "Add an employee to the list") {
            addEmp();
        }
    });
}

function addEmp() {
    inquirer.prompt([
            {
                type: "input",
                message: "To which department would you like to add the new employee?",
                name: "new_dept"
            },
            {
                type: "input",
                message: "What is the new employee's role?",
                name: "new_role"
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
            connection.query("INSERT INTO employees (first_name, last_name) VALUES (?, ?)", [response.new_firstname, response.new_lastname], (err, result) => {
                if (err) throw err;
                console.table("New Employee",
                    {
                        Id: result.insertId,
                        Name: [response.new_firstname + " " + response.new_lastname]
                    }
                );
            });
        });  
}

module.exports = {viewEmps, next, addEmp};
