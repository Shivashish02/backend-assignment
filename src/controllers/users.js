const { Users } = require('../db/models')

async function createUser(email,password) {
  const user = await Users.create({
    email: email,
    password: password
  })
  return user
}

async function getallusers() {
  const users = await Users.findAll()
  return users
}


module.exports = {
  createUser,
  getallusers
}

