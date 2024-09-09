const { Error } = require("../DB/Modals/Error");

const errorHandler = (err, req, res, next) => {
  console.error("Error occurred:", err.stack || err);
  let error = {
    statusCode: err.statusCode || 500,
    error: err.message || "Server Eroor",
    stack: err.stack,
  };

  const errorDetails = new Error(error);

  errorDetails
    .save()
    .then(() => {
      console.log("Error saved in MongoDB");
    })
    .catch((error) => {
      console.error("Errro saving in MongoDB", error);
    });

  res.status(error.statusCode).json({
    success: false,
    error: error.error,
  });
};

module.exports = errorHandler;
