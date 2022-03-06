const { Router } = require('express')
const jwt = require("jsonwebtoken")
const { Posts, Users } = require('../db/models')
const {
    createUser,
    getallusers
} = require('../controllers/users')
const {
    createPost,
    deletePost,
} = require('../controllers/posts')


const route = Router()

route.get('/all', async (req, res) => {
    const users = await getallusers()
    res.send(users)
})

route.post('/authenticate', async (req, res) => {                                       //ok
    const user = await createUser(req.body.email, req.body.password)
    const uuid = user.uuid
    const id = user.id
    const token = await jwt.sign({ uuid, id }, "thisismysecretkey")
    res.send({ "token": token })
})

route.post('/follow/:id', async (req, res) => {                                         //ok
    const userver = jwt.verify(req.body.token, "thisismysecretkey")
    const userid = userver.id
    const entry = await Users.findAll({
        where: {
            id: req.params.id
        }
    })
    if (entry.length !== 0) {
        const entry1 = await Users.findAll({
            where: {
                id: req.params.id
            },
            attributes: ['followers'],
        })
        const entry2 = await Users.findAll({
            where: {
                id: userid
            },
            attributes: ['following'],
        })
        const index = entry1[0].followers.indexOf(userid);
        if (index > -1) {
            res.send("User has already been followed")
        }
        else {
            let arr1 = entry1[0].followers
            let arr2 = entry2[0].following
            arr1.push(userid)
            arr2.push(req.params.id)
            await Users.update(
                { followers: arr1 },
                { where: { id: req.params.id } })
            await Users.update(
                { following: arr2 },
                { where: { id: userid } })

            res.send("User has been followed")
        }
    }
    else {
        res.send("User does not exist")
    }

})

route.post('/unfollow/:id', async (req, res) => {                                           //ok
    const userver = jwt.verify(req.body.token, "thisismysecretkey")
    const userid = userver.id
    const entry = await Users.findAll({
        where: {
            id: req.params.id
        }
    })
    if (entry.length !== 0) {
        const entry1 = await Users.findAll({
            where: {
                id: req.params.id
            },
            attributes: ['followers'],
        })
        const entry2 = await Users.findAll({
            where: {
                id: userid
            },
            attributes: ['following'],
        })
        const index1 = entry1[0].followers.indexOf(userid);
        const index2 = entry2[0].following.indexOf(req.params.id);
        if (index1 > -1) {
            let arr1 = entry1[0].followers
            let arr2 = entry2[0].following
            arr1.splice(index1, 1)
            arr2.splice(index2, 1)
            await Users.update(
                { followers: arr1 },
                { where: { id: req.params.id } })
            await Users.update(
                { following: arr2 },
                { where: { id: userid } })
            res.send("User has been unfollowed")
        }
        else {
            res.send("User was never followed in the first place")
        }
    }
    else {
        res.send("User does not exist")
    }
})

route.get('/user/:token', async (req, res) => {                                             //ok
    const userver = jwt.verify(req.params.token, "thisismysecretkey")
    const userid = userver.id
    const entry = await Users.findAll({
        where: {
            id: userid
        }
    })
    res.send({
        "User Name": entry[0].email,
        "followers": entry[0].followers.length,
        "following": entry[0].following.length,
    })
})

route.post('/posts', async (req, res) => {                                                 //ok
    const userver = jwt.verify(req.body.token, "thisismysecretkey")
    const userid = userver.id
    const post = await createPost(userid, req.body.title, req.body.desc)
    const obj = {
        "Post-ID": post.id,
        "Title": post.title,
        "Description": post.desc,
        "Created Time": post.createdAt,
    }
    res.send(obj)
})

route.delete('/posts/:id', async (req, res) => {                                           //ok
    const f = await Posts.findAll({
        where: {
            id: req.params.id
        }
    })
    if (f.length !== 0) {
        await deletePost(req.params.id)
        res.send("Post has been deleted")
    }
    else {
        res.send("There is no such post")
    }
})

route.post('/like/:postid', async (req, res) => {                                           //ok
    const userver = jwt.verify(req.body.token, "thisismysecretkey")
    const userid = userver.id
    const f = await Posts.findAll({
        where: {
            id: req.params.postid
        }
    })
    if (f.length !== 0) {
        const entry = await Posts.findAll({
            where: {
                id: req.params.postid
            },
            attributes: ['likes'],
        })
        const index = entry[0].likes.indexOf(userid);
        if (index > -1) {
            res.send("Post has already been liked")
        }
        else {
            let arr = entry[0].likes
            let num = userid
            arr.push(num)
            await Posts.update(
                { likes: arr },
                { where: { id: req.params.postid } })
            res.send("Post has been liked")
        }
    }
    else {
        res.send("Post does not exist")
    }
})

route.post('/unlike/:postid', async (req, res) => {                                            //ok
    const userver = jwt.verify(req.body.token, "thisismysecretkey")
    const userid = userver.id
    const f = await Posts.findAll({
        where: {
            id: req.params.postid
        }
    })
    if (f.length !== 0) {
        const entry = await Posts.findAll({
            where: {
                id: req.params.postid
            },
            attributes: ['likes'],
        })
        const index = entry[0].likes.indexOf(userid);
        if (index > -1) {
            let arr = entry[0].likes
            arr.splice(index, 1)
            await Posts.update(
                { likes: arr },
                { where: { id: req.params.postid } })
            res.send("Post has been unliked")
        }
        else {
            res.send("You haven't liked this post")
        }
    }
    else {
        res.send("Post does not exist")
    }
})

route.post('/comment/:postid', async (req, res) => {                            //ok
    const userver = jwt.verify(req.body.token, "thisismysecretkey")
    const userid = userver.id
    const f = await Posts.findAll({
        where: {
            id: req.params.postid
        }
    })
    const entry = await Posts.findAll({
        where: {
            id: req.params.postid
        },
        attributes: ['comments'],
    })
    if (f.length !== 0) {
        let arr = entry[0].comments
        let str = req.body.comment
        arr.push(str)
        await Posts.update(
            { comments: arr },
            { where: { id: req.params.postid } })
        const commentid = ((arr.length) - 1)
        res.send({ commentid })
    }
    else {
        res.send("post does not exist")
    }
})

route.get('/posts/:postid', async (req, res) => {                  //ok
    const entry = await Posts.findAll({
        where: {
            id: req.params.postid
        }
    })
    if (entry.length !== 0) {
        const obj = {
            'title': entry[0].title,
            'desc': entry[0].desc,
            'comments': entry[0].comments,
            'likes': entry[0].likes.length,
        }
        res.send(obj)
    }
    else {
        res.send("post does not exist")
    }
})

route.get('/all_posts', async (req, res) => {                       //ok
    const arr = await Posts.findAll({
        attributes: ['id', 'title', 'desc', 'createdAt', 'comments', 'likes'],
    })
    const newarr = []
    arr.forEach(entry => {
        const obj = {
            'id': entry.id,
            'title': entry.title,
            'desc': entry.desc,
            'createdAt': entry.createdAt,
            'comments': entry.comments,
            'likes': entry.likes.length,
        }
        newarr.push(obj);
    });
    res.send(newarr)
})


module.exports = {
    apiRoute: route
}



