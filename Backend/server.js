const express = require("express");
const cookieParser = require("cookie-parser");
const cloudinary = require("./Config/cloudinary");
const errorHandler = require("./middlewares/ErrorHandler");
const app = express();
require("dotenv").config();
const morgan = require("morgan");
var cors = require("cors");
var bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const dbConnect = require("./Config/database");

const port = process.env.PORT || 3000;

// Routes Mount
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

// we use cors because backend entertain the frontend request
const corsOptions = {
  origin: "http://localhost:5173", // restricts access to this origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // allowed headers
  credentials: true, // allows cookies and credentials to be sent
  optionsSuccessStatus: 204, // status code for successful OPTIONS requests
};
app.use(cors(corsOptions)); // Read About This

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Mongo atlas se connect
dbConnect();

// Cloudinary se connect
cloudinary.cloudinaryConnect();

// Body parser
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
app.use("/api/v1/courses", courseRoute);
app.use("/api/v1/profiles", profileRoute);
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
