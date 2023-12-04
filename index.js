const exp = require("express")
const app = exp()
const mongoose = require("mongoose")
require("dotenv").config()
const mainRouter = require("./Router/mainRouter")
const bodyParser = require("body-parser")
const Port = 5000
const dbUrl = process.env.connectString
mongoose.connect(dbUrl)
const db = mongoose.connection
db.once("open", () => {
    console.log("MONGODB CONNECTed")
})
db.on("error", () => {
    console.log("connect error ")
})

app.use(bodyParser.json())
app.use(mainRouter)

app.get('/', (req, res) => {
    res.status(200).json('Welcome, your app is working well');
  })
  

app.listen(Port, () => {
    console.log("Port is listening at ", Port)
})