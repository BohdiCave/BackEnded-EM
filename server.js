var myApp = require("./dbFunctions.js");
var express = require("express");

var app = express();

var PORT = process.env.PORT || 8080;

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(PORT, function() {
    console.log("Server listening on: http://localhost:" + PORT);
});

myApp.viewEmps();

       