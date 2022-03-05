const express = require('express')

const { db } = require('./db/models')
const { apiRoute } = require('./routes/api')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', apiRoute)


db.sync()
  .then(() => {
    app.listen(8383, () => {
      console.log('server started on http://localhost:8383')
    })
  })
  .catch((err) => {
    console.error(new Error('Could not start database'))
    console.error(err)
  })
