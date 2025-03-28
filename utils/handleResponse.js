// utils/handleResponse.js

const handleResponse = (err, results, res) => {
    if (err) {
      return res.status(500).json({ status: false, message: err.message, data: [] });
    }
    if (results.length === 0) {
      return res.json({ status: false, message: "No data available", data: [] });
    }
    return res.json({ status: true, message: "", data: results });
  };
  
  module.exports = handleResponse;
  