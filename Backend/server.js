const express = require("express");
const cookieParser = require("cookie-parser");
const { main } = require("./DB/db");
const app = express();
require("dotenv").config();
const morgan = require('morgan');

const port = process.env.PORT || 3000;

// All Routes import
const authRoute = require("./Routes/Auth");
const profileRoute = require("./Routes/Profile");
const courseRoute = require("./Routes/Course");
const paymentsRoute = require("./Routes/Payments");
const reviewsRoute = require("./Routes/RatingAndReviews");
const categoryRoute = require("./Routes/Category");
const courseprogressRoute = require("./Routes/CourseProgress");
const otherRoute = require("./Routes/Other");
const sectionRoute = require("./Routes/Section");
const subsectionRoute = require("./Routes/SubSection");
const userRoute = require("./Routes/User");

const errorHandler = require("./middlewares/ErrorHandler");

// we use cors because backend entertain the frontend request
var cors = require("cors");
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

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

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/profile", profileRoute);
app.use("/api/v1/payments", paymentsRoute);
app.use("/api/v1/reviews", reviewsRoute);
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/courseprogress", courseprogressRoute);
app.use("/api/v1/other", otherRoute);
app.use("/api/v1/sections", sectionRoute);
app.use("/api/v1/subsections", subsectionRoute);

app.use(errorHandler); // This is for when error occur in our Application

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
