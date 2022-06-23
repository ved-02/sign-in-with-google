const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
// google Auth
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = ""; //CLIENT_ID provided on google console
const client = new OAuth2Client(CLIENT_ID);

const app = express();
const PORT = process.env.PORT || 5000;

app.set("view engine", "ejs");
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

function checkAuthenticated(req, res, next) {
    const token = req.cookies["session-token"];
    let user = {};
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
    }
    verify()
        .then(() => {
            req.user = user;
            next();
        })
        .catch(err => {
            res.redirect("/login");
        })
}

app.get("/", (req, res) => {
    res.render("index.ejs")
});
app.get("/login", (req, res) => {
    res.render("login.ejs")
});
app.post("/login", async (req, res) => {
    const token = req.body.token;
    console.log(token);
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        // console.log(payload);
    }
    await verify()
        .then(() => {
            res.cookie('session-token', token);
            res.send("success");
        })
        .catch(console.error);

});
app.get("/dashboard", checkAuthenticated, (req, res) => {
    const user = req.user;
    res.render("dashboard.ejs", { user });
});
app.get("/protectedroute", checkAuthenticated, (req, res) => {
    res.render("protectedroute.ejs");
});
app.get("/logout", (req, res) => {
    res.clearCookie("session-token");
    res.redirect("/login");
})

app.listen(PORT, () => {
    console.log(`server on port ${PORT}`)
})