const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const router = express.Router();
const randomstring = require("randomstring");
const db = require("../models/");
const { sendEmail } = require("../../utils/email");

router.get("/all", async (req, res) => {
  console.log("Get all users hit");
  db.users
    .find()
    .exec()
    .then((result) => {
      console.log(result);
      if (!result)
        res.status(404).json({
          success: false,
          message: "No users found",
        });

      res.status(200).json({
        success: true,
        data: result,
      });
    })
    .catch((error) => {
      res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
        })
        .end();
    });
});

router.post("/register", async (req, res) => {

  if (
    !req.body ||
    !req.body.data.email ||
    !req.body.data.name ||
    !req.body.data.contactDetails ||
    !req.body.data.password
  )
    res.status(500).json({
      message: "Missing body data",
      success: false,
    });

  db.users.findOne({ email: req.body.data.email }).then(async (result) => {
    if (result) {
      console.log("Email already present::", result.email);
      res.status(200).json({
        message: "Email already present",
        success: false,
      });
    } else {
      const secretToken = randomstring.generate();
      const hashedPassword = await bcrypt.hash(req.body.data.password, 10);

      const user = new db.users({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.data.name,
        email: req.body.data.email,
        phone: req.body.data.phone,
        password: hashedPassword,
        user_creation_date: Date(),
        secretToken,
      });

      user
        .save()
        .then((result) => {
          sendEmail({
            email: result.email,
            subject: "Welcome to StraySpirit",
            content: `
                    <a href='${process.env.WEBSITE_DOMAIN}/' target='_blank'>
                        <img src='cid:EightVue_Logo' alt='EightVue Logo' style='margin-top:15px'>
                    </a>
                    <h1>Welcome to StraySpirit, ${req.body.name}!</h1>
                    <a href='${process.env.WEBSITE_DOMAIN}/verify/${result.secretToken}' target='_blank'>
                        <button style='border:none;background:#1abcfe;color:#fff;padding:10px'> Verify your Account here </button>
                    </a>
                    <p> If the above button does not work, access the link here - ${process.env.WEBSITE_DOMAIN}/verify/${result.secretToken}</p>
                    `,
            attachments: [
              {
                filename: "Eightvue_logo.png",
                path: "./public/images/Eightvue_logo_new.png",
                cid: "EightVue_Logo",
              },
            ],
          });
          res.status(200).json({
            message:
              "Your account is created! Check your email to verify your account",
            success: true,
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: "Internal server error",
            error: err,
            success: false,
          });
        });
    }
  });
});

module.exports = router;