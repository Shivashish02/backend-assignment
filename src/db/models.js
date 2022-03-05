const Sequelize = require('sequelize')

const db = new Sequelize({
    dialect: 'postgres',
    database: 'test',
    username: 'postgres',
    password: 'abcd',
})

const COL_ID_DEF = {
    type: Sequelize.DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
}
const COL_STRING_DEF = {
    type: Sequelize.DataTypes.STRING,
    unique: true,
    allowNull: false
}
const COL_TITLE_DEF = {
    type: Sequelize.DataTypes.STRING,
    allowNull: false
}

const Users = db.define('user', {
    id: COL_ID_DEF,
    uuid: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4
    },
    email: COL_STRING_DEF,
    password: COL_STRING_DEF,
    followers: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: false,
        defaultValue: []
    },
    following: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: false,
        defaultValue: []
    }
})

const Posts = db.define('post', {
    id: COL_ID_DEF,
    uuid: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4
    },
    title: COL_TITLE_DEF,
    desc: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false
    },
    comments: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: []
    },
    likes: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: false,
        defaultValue: []
    }
})


Users.hasMany(Posts)
Posts.belongsTo(Users)


module.exports = {
    db,
    Users,
    Posts,
}