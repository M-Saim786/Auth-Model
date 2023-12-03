const exp = require("express")
const { userCreate, verifyOtp, loginUser, forgetPassword, updatePassword } = require("../Controller/userController")
const router = exp.Router()
// const userController=  \


router.post("/signup", userCreate)
router.post("/verifyOtp", verifyOtp)
router.post("/login", loginUser)
router.post("/forgetPassword", forgetPassword)
router.post("/updatePassword/:id", updatePassword)
module.exports = router