const express = require('express')
const app = express()
const port = 5000

app.get('/api', (req, res) => {
  res.send('Hello Worlds with cicd!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})