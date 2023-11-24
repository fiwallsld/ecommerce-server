exports.summaryError = (error, next) => {
  if (!error.statusCode) {
    error.statusCode = 500;
  }
  next(error);
};

exports.notFoundError = (string) => {
  const error = new Error(string);
  error.statusCode = 422;
  throw error;
};

exports.throwError = (status, string) => {
  const error = new Error(string);
  error.statusCode = status;
  throw error;
};
