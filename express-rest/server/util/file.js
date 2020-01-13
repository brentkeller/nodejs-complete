const path = require('path');
const fs = require('fs');

exports.deleteImage = async filePath => {
  // Get full disk path by going up a level since we're in a folder now
  filePath = path.join(__dirname, '..', filePath);
  fs.exists(filePath, exists => {
    if (exists) {
      fs.unlink(filePath, err => {
        if (err) throw err;
      });
    }
  });
};
