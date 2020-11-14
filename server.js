var express = require("express");
var mysql = require("mysql");
var inquirer = require("inquirer");
var tables = require("console.table");
var path = require("path");

var app = express();

var PORT = process.env.PORT || 8080;

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serving static files from the public directory
app.use(express.static(path.join(__dirname, "/public")));

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

app.listen(PORT, function() {
    console.log("Server listening on: http://localhost:" + PORT);
});