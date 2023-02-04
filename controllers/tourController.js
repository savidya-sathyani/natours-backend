const fs = require('fs');

const allTourFile = `${__dirname}/../dev-data/data/tours-simple.json`;
const allTours = JSON.parse(fs.readFileSync(allTourFile));

const STATUS = {
  SUCCESS: 'success',
  FAIL: 'fail',
  ERROR: 'error',
};

const logTime = (req) => {
  console.log(`LOGGER:: Request time:${req.requestTime}`);
};

exports.validateId = (req, res, next, val) => {
  const id = val * 1;
  const tour = allTours.find((item) => item.id === id);
  if (!tour) {
    return res.status(404).json({
      status: STATUS.ERROR,
      message: 'Tour not found!!',
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  logTime(req);
  const data = {
    status: STATUS.SUCCESS,
    results: allTours.length,
    data: {
      tours: allTours,
    },
  };
  res.status(200).json(data);
};

exports.getTourById = (req, res) => {
  logTime(req);
  // Multiply by 1 to convert to number
  const id = req.params.id * 1;
  const tour = allTours.find((item) => item.id === id);
  res.status(200).json({
    status: STATUS.SUCCESS,
    results: 1,
    data: {
      tour: tour,
    },
  });
};

exports.addTour = (req, res) => {
  logTime(req);
  // Only possible since we used express.json middleware
  const newId = allTours[allTours.length - 1].id + 1;
  const newTour = {
    id: newId,
    ...req.body,
  };

  allTours.push(newTour);
  fs.writeFile(allTourFile, JSON.stringify(allTours), (err) => {
    if (err) {
      res.status(400).json({
        status: STATUS.FAIL,
        message: 'Failed to insert. Please try again!!',
      });
    }

    res.status(201).json({
      status: STATUS.SUCCESS,
      data: {
        tour: newTour,
      },
    });
  });
};

exports.updateTour = (req, res) => {
  logTime(req);

  const newTour = {
    ...tour,
    ...req.body,
  };
  allTours[allTours.indexOf(tour)] = newTour;

  fs.writeFile(allTourFile, JSON.stringify(allTours), (err) => {
    if (err) {
      res.status(400).json({
        status: STATUS.FAIL,
        message: 'Failed to update. Please try again!!',
      });
    }
    res.status(200).json({
      status: STATUS.SUCCESS,
      data: {
        tour: newTour,
      },
    });
  });
};

exports.deleteTour = (req, res) => {
  logTime(req);
  const newTours = allTours.filter((item) => item.id !== id);
  fs.writeFile(allTourFile, JSON.stringify(newTours), (err) => {
    if (err) {
      res.status(400).json({
        status: STATUS.FAIL,
        message: 'Failed to update. Please try again!!',
      });
    }
    res.status(204).json({
      status: STATUS.SUCCESS,
      data: null,
    });
  });
};
