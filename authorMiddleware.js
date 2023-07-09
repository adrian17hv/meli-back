const authorMiddleware = function (req, res, next) {
  res.locals.author = {
    name: "adrian",
    lastName: "villalba",
  };
  next();
};
exports.authorMiddleware = authorMiddleware;
