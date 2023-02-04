const fs = require('fs');

const STATUS = {
  SUCCESS: 'success',
  FAIL: 'fail',
  ERROR: 'error',
};

const logTime = (req) => {
  console.log(`LOGGER:: Request time:${req.requestTime}`);
};

const allUserFile = `${__dirname}/../dev-data/data/users.json`;
const allUsers = JSON.parse(fs.readFileSync(allUserFile));

exports.getAllUsers = (req, res) => {
  console.log(`LOGGER:: Request time:${req.requestTime}`);
  const data = {
    status: STATUS.SUCCESS,
    results: allUsers.length,
    data: {
      users: allUsers,
    },
  };
  res.status(200).json(data);
};

exports.addUser = (req, res) => {
  res.status(500).json({
    status: STATUS.ERROR,
    message: 'Something went wrong!!',
  });
};

exports.getUserById = (req, res) => {
  res.status(500).json({
    status: STATUS.ERROR,
    message: 'Something went wrong!!',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: STATUS.ERROR,
    message: 'Something went wrong!!',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: STATUS.ERROR,
    message: 'Something went wrong!!',
  });
};
