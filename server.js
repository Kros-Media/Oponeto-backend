const express = require('express')
// const MongoClient = require('mongodb')
const port = 3003
const app = express()

app.get("/api", (req, res)=>{
    res.json({"users": ["userOne", "userTwo", "userThree"]})
})

app.listen(port,()=>{console.log(`Server nasłuchuje na porcie ${port}`);})