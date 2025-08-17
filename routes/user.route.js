const express = require('express');
const router = express.Router();

//test endpoint
router.get('/', (req, res) => {
  res.json({ message: 'Users API placeholder' });
});

module.exports = router;
