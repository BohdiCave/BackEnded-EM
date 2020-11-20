const myApp = require("./myApp.js");
// Express.JS
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(PORT, function() {
    console.log("Server listening on: http://localhost:" + PORT);
});

myApp.viewEmps();