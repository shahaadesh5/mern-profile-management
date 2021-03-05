const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const randomstring = require("randomstring");
const bcrypt = require("bcrypt");

const {sendEmail} = require("../../utils/email");
const users = require("../models/users");


const router = express.Router();

router.get("/all", async (req, res) => {
    console.log("Get all users hit");
    users.find().exec().then((result) => {
        if (!result || !result.length) 
            return res.status(404).json({success: false, message: "No users found"});
        
        return res.status(200).json({success: true, data: result});
    }).catch((error) => {
        return res.status(500).json({success: false, message: "Internal Server Error"}).end();
    });
});

router.get("/user/:id", async (req, res) => {
    console.log("Get user by id hit");

    const userId = req.params.id;

    if (! userId) 
        return res.status(404).json({success: false, message: "No user id provided"})

    users.findById(userId).exec().then((result) => {
        if (!result) 
            return res.status(404).json({success: false, message: "No user found"});
        
        return res.status(200).json({success: true, data: result});
    }).catch((error) => {
        return res.status(500).json({success: false, message: "Internal Server Error"}).end();
    });
});

router.delete("/user/:id", async (req, res) => {
    console.log("Delete user by id hit");

    const userId = req.params.id;

    if (! userId) 
        return res.status(404).json({success: false, message: "No user id provided"})

    users.findByIdAndDelete(userId).then((result) => {
        if (!result) 
            return res.status(404).json({success: false, message: "No user found"});
        
        return res.status(200).json({success: true, message: "User Deleted!"});
    }).catch((error) => {
        return res.status(500).json({success: false, message: "Internal Server Error"}).end();
    });
});

router.put("/user/:id", async (req, res) => {
    console.log("Update user by id hit");

    const userId = req.params.id;

    const { user } = req.body.data;

    if (! userId) 
        return res.status(404).json({success: false, message: "No user id provided"})

    if (! user) 
        return res.status(404).json({success: false, message: "No user Data found to update"})

    users.findByIdAndUpdate(userId, user, (err, result) => {
        if(err)
            return res.status(500).json({success: false, message: "Internal Server Error"}).end();
        else if(result === null)
            return res.status(404).json({success: false, message: "No user found"});
        else
            return res.status(200).json({success: true, message: "User Updated!", data: result});
    })
});

router.post("/register", async (req, res) => {

    console.log("Register user hit!", req.body)

    if (!req.body || !req.body.data.email || !req.body.data.name || !req.body.data.password) 
        return res.status(500).json({message: "Missing body data", success: false});
    users.findOne({email: req.body.data.email}).then(async (result) => {
        if (result) {
            console.log("Email already present::", result.email);
            return res.status(200).json({message: "Email already present", success: false});
        } else {
            const secretToken = randomstring.generate();
            const hashedPassword = await bcrypt.hash(req.body.data.password, 10);

            const user = new users({
                _id: new mongoose.Types.ObjectId(),
                name: req.body.data.name,
                email: req.body.data.email,
                password: hashedPassword,
                user_creation_date: Date(),
                secretToken
            });

            user.save().then((result) => {
                sendEmail({
                        email: result.email, subject: "Welcome to the App", content: `
                    <a href='${
                        process.env.WEBSITE_DOMAIN
                    }/' target='_blank'>
                        <img src='cid:logo' alt='Logo' style='margin-top:15px; max-width: 100px'>
                    </a>
                    <h1>Welcome to the App, ${
                        req.body.name.firstName
                    }!</h1>
                    <a href='${
                        process.env.WEBSITE_DOMAIN
                    }/verify/${
                        result.secretToken
                    }' target='_blank'>
                        <button style='border:none;background:#1abcfe;color:#fff;padding:10px'> Verify your Account here </button>
                    </a>
                    <p> If the above button does not work, access the link here - ${
                        process.env.WEBSITE_DOMAIN
                    }/verify/${
                        result.secretToken
                    }</p>
                    `,
                    attachments: [
                        {
                            filename: "logo.png",
                            path: "./public/images/logo.png",
                            cid: "logo"
                        },
                    ]
                });
                return res.status(200).json({message: "Your account is created! Check your email to verify your account", success: true});
            }).catch((err) => {
                return res.status(500).json({message: "Internal server error", error: err, success: false});
            });
        }
    }).catch((err) => {
        return res.status(500).json({message: "Internal server error", error: err, success: false});
    });
});

module.exports = router;
