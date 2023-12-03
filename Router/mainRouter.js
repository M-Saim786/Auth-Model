const exp = require("express")
const userRouter = require("./userRouter")
const router = exp.Router()


router.use("/user", userRouter)
// router.post("/hello", (req, res) => {
//     console.log(req.body)
//     return res.status(200).json({
//         message: "User hello",
//         // data: user
//     })
// })

module.exports = router