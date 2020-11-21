const express = require('express');

const PORT = 8080;

//Create express app
const app = express();

//Static folder
app.use(express.static('public'));

//Start server
app.listen(
    PORT,
    console.log(`Server running on port ${PORT}`)
);