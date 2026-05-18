// utils.js
function encodeToBase64(buffer) {
    if (buffer) {
      return `data:image/jpeg;base64,${buffer.toString('base64')}`;
    }
    return 'No Photo Available'; // Default value for null buffers
  }
  
  module.exports = {
    encodeToBase64,
  };
  