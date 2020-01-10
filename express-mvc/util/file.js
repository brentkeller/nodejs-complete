const fs = require('fs');

const deleteFile = filePath => {
  fs.exists(filePath, exists => {
    if (exists) {
      fs.unlink(filePath, err => {
        if (err) throw err;
      });
    }
  });
};

exports.deleteFile = deleteFile;
