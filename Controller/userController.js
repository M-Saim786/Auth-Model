const userSchema = require("../Model/userSchema")
const bcrypt = require("bcrypt")
const jWt = require("jsonwebtoken")
const nodeMailer = require("nodemailer")
require("dotenv").config()
const secretkey = process.env.secretkey


exports.userCreate = async (req, res) => {
    try {
        const { email, password } = req.body
        let checkEmail = await userSchema.findOne({ email })
        console.log("checkEmail", checkEmail)
        if (!checkEmail) {
            // console.log("email mil gya")
            const hashPassword = await bcrypt.hash(password, 12)
            const otp = Math.floor(Math.random() * 90000)
            console.log("otp", otp)

            req.body.password = hashPassword
            req.body.otp = otp

            const user = userSchema(req.body) //PROVIDEA DATA TO MODEL
            console.log(user)
            await user.save()

            // generate token
            const token = jWt.sign({ user_id: user._id }, secretkey, { expiresIn: "2h" })
            // console.log("token", token)           
            const TransPorter = nodeMailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.smtpMail,
                    pass: process.env.smtpPassKey
                },
                tls: {
                    // do not fail on invalid certs
                    rejectUnauthorized: false,
                },
            })

            const infoMail = {
                from: process.env.smtpemail,
                to: email,
                subject: "Welcome to OTP Verification Services",
                html: `<h1>Verify Account</h1>
                    <p>your otp is : ${otp}</p>`
            }
            TransPorter.sendMail(infoMail, (err, result) => {
                if (err) {
                    console.log(err)
                }
            })


            return res.status(200).json({
                message: "User Created",
                data: user,
                token: token
            })

        } else {
            return res.json({
                message: "Email Already exsist"
            })

        }
    }
    catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            error: err
        });

    }

}

exports.verifyOtp = async (req, res) => {
    try {
        const { body, headers } = await req
        const { authorization } = headers
        const { otp } = body
        if (!authorization) {
            return res.status(401).json({
                message: "Token not provided"
            })
        } else {
            if (otp == undefined) {
                return res.status(401).json({
                    message: "otp not provide"
                })
            } else if (otp.length != 5) {
                return res.status(401).json({
                    message: "Otp must be 5 letter"
                })
            } else {
                jWt.verify(authorization, secretkey, async (err, decode) => {
                    if (err) {
                        return res.status(401).json({
                            message: "Invalid Token"
                        })
                    }
                    console.log("decode", decode)
                    req.userid = decode.user_id
                    const userFind = await userSchema.findById(decode.user_id)
                    console.log("userFind", userFind)
                    if (userFind.otp == otp) {
                        await userFind.updateOne({
                            isVerify: true
                        })
                        return res.status(200).json({
                            message: "Otp Verify Success "
                        })
                    }
                    else {
                        return res.status(401).json({
                            message: "Invalid Otp"
                        })
                    }
                })
            }
        }
    }
    catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            error: err
        });
    }
}

exports.loginUser = async (req, res) => {
    const { body, headers } = req
    const { authorization } = headers
    const { email, password } = body
    const user = await userSchema.findOne({ email })
    // console.log("user founbd", user)
    if (user) {
        if (password) {
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    // Handle error
                    // console.error(err);
                    return res.status(500).json({
                        message: "Internal Error",
                        error: err,
                    })
                }
                if (result) {
                    // Passwords match
                    const token = jWt.sign({ user_id: user._id }, secretkey, { expiresIn: 60 })

                    return res.status(200).json({
                        message: "Login Succces",
                        data: user,
                        token: token
                    })
                } else {
                    return res.status(401).json({
                        message: "Incorrect Password",
                        // token: token
                    })
                }
            });
        }
        else {
            return res.status(401).json({
                message: "Enter Password!!",
                // token: token
            })
        }
    } else {
        return res.status(401).json({
            message: "User Not Found.!",
            // token: token
        })

    }
}

exports.forgetPassword = async (req, res) => {
    const { email } = req.body
    const user = await userSchema.findOne({ email })
    if (user.email) {
        console.log("user", user)
        // if (user)
        const token = jWt.sign({ user_id: user._id }, secretkey, { expiresIn: 60 * 60 })
        return res.status(200).json({
            message: "This forget token expires in 1 hour",
            // data: user,
            token: token
        })
    } else {
        return res.status(500).json({
            message: "Not Found!!"
        })
    }
}

exports.updatePassword = async (req, res) => {
    const Id = req.params.id;
    console.log("Id", Id);
    const { body, headers } = req
    const { authorization } = headers
    const { email, password } = body
    // console.log("passowrd",password)
    if (!authorization) {
        return res.status(404).json({
            message: "Token Not Found "
        })
    }
    else if (!body.password) {
        return res.status(404).json({
            message: "Password Not Found"
        })
    }
    else {
        const hashPassword = await bcrypt.hash(password, 12)
        req.body.password = hashPassword
        const update = { password: req.body.password }
        console.log("updated", update)
        await userSchema.findOneAndUpdate({ _id: Id }, update).then((data) => {
            res.status(200).json({
                message: "Passowrd Updated",
                data: data,
                success: true,
            });
        }).catch((err) => {
            res.status(400).json({
                data: err,
                success: false,
            });
        });
        // await user.set({
        //     password: req.body.password
        // // })
        // return res.status(200).json({
        //     message: "Passowrd Updated",
        //     data: user,

        // })
    }
}