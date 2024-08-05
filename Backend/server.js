const express = require("express");
const cookieParser = require("cookie-parser");
const { main } = require("./DB/db");
const app = express();
require("dotenv").config();

const port = process.env.PORT || 3000;

// All Routes import
const userRoute = require("./Routes/User");
const profileRoute = require("./Routes/Profile");
const courseRoute = require("./Routes/Course");
const paymentsRoute = require("./Routes/Payments");

// we use cors because backend entertain the frontend request
var cors = require("cors");
app.use(
  cors({
    origin: "https://localhost:port no",
    credentials: true,
  })
);

// Mongo atlas connect
main().catch((err) => console.log(err));

// Cloudinary se connect
const cloudinary = require("./Config/cloudinary");
cloudinary.cloudinaryConnect();

// Body parser
var bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded());

// Use cookie-parser middleware
app.use(cookieParser());

// Use file-upload
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/user", userRoute);
app.use("/api/course", courseRoute);
app.use("/api/profile", profileRoute);
app.use("/api/payments", paymentsRoute);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
