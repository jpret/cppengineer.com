
// Imports - Libraries
const express = require('express');
const router = express.Router();

// Imports - Middleware
const { connectToSocketAndWrite } = require('../middleware/sendTcpClient');

// @desc    Landing page
// @route   GET /
router.get('/', async (req, res) => {
    let resultSocket = await connectToSocketAndWrite(5353, "Hello C++ Server!");
    res.send(resultSocket);
});

// Export router
module.exports = router;