const express = require('express')
const app = express()
const port = 3005

app.use(express.static('public'))

const server = app.listen(3005, '127.0.0.1', () => {
    console.log(`Express running → PORT ${server.address().port}`);
});