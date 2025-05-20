const express = require("express");
const path = require("path");
const fs = require("fs");

module.exports = function protectedStatic(dirPath, options = {}) {
  const {
    authMiddleware,
    requireAuth = true,
    defaultImage = "default.png",
  } = options;

  return function (req, res, next) {
    // Set CORS headers first
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, HEAD");
    res.header("Access-Control-Allow-Headers", "Content-Type");

    const filePath = path.join(dirPath, req.path);

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        // File doesn't exist, try default image
        if (defaultImage) {
          const defaultPath = path.join(dirPath, defaultImage);
          if (fs.existsSync(defaultPath)) {
            req.url = `/${defaultImage}`;
          } else {
            return res.status(404).end(); // Proper 404 if no default image
          }
        } else {
          return res.status(404).end();
        }
      }

      // Handle authentication if required
      if (requireAuth && authMiddleware) {
        return authMiddleware(req, res, (err) => {
          if (err) return next(err);
          express.static(dirPath)(req, res, next);
        });
      }

      // Serve the file
      express.static(dirPath)(req, res, next);
    });
  };
};

// const express = require("express");
// const path = require("path");
// const fs = require("fs");

// module.exports = function protectedStatic(dirPath, options = {}) {
//   const {
//     authMiddleware,
//     requireAuth = true,
//     defaultImage = "default.png",
//   } = options;

//   return function (req, res, next) {
//     const filePath = path.join(dirPath, req.path);

//     fs.access(filePath, fs.constants.F_OK, (err) => {
//       if (err) {
//         if (defaultImage && fs.existsSync(path.join(dirPath, defaultImage)))
//           req.url = `/${defaultImage}`;
//         else return res.status(204).end();
//       }

//       if (requireAuth && authMiddleware) {
//         return authMiddleware(req, res, (err) => {
//           if (err) return next(err);
//           express.static(dirPath)(req, res, next);
//         });
//       }

//       express.static(dirPath)(req, res, next);
//     });

//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "GET, HEAD");
//     res.header("Access-Control-Allow-Headers", "Content-Type");
//     next();
//   };
// };
