const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFearures');

const STATUS = {
  SUCCESS: 'success',
  FAIL: 'fail',
  ERROR: 'error',
};

const logTime = (req) => {
  console.log(`LOGGER:: Request time:${req.requestTime}`);
};

exports.bestTours = (req, res, next) => {
  req.query = {
    ...req.query,
    limit: '5',
    sort: '-ratingAverage,price',
  };
  next();
};

exports.getAllTours = async (req, res) => {
  logTime(req);
  try {
    const featuresAdded = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .filterFields()
      .pagination();
    const allTours = await featuresAdded.query;

    res.status(200).json({
      status: STATUS.SUCCESS,
      results: allTours.length,
      data: {
        tours: allTours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: STATUS.FAIL,
      message: err.message,
    });
  }
};

exports.getTourById = async (req, res) => {
  logTime(req);
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: STATUS.SUCCESS,
      results: 1,
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: STATUS.FAIL,
      message: err.message,
    });
  }
};

exports.addTour = async (req, res) => {
  logTime(req);
  try {
    const newTour = await Tour.create(req.body);
    if (newTour) {
      res.status(201).json({
        status: STATUS.SUCCESS,
        data: {
          tour: newTour,
        },
      });
    }
  } catch (err) {
    res.status(400).json({
      status: STATUS.FAIL,
      message: err.message,
    });
  }
};

exports.updateTour = async (req, res) => {
  logTime(req);

  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: STATUS.SUCCESS,
      data: {
        tour: updatedTour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: STATUS.FAIL,
      message: err.message,
    });
  }
};

exports.deleteTour = async (req, res) => {
  logTime(req);
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: STATUS.SUCCESS,
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: STATUS.FAIL,
      message: err.message,
    });
  }
};

exports.getToursStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty',
          averageRating: { $avg: '$ratingsAverage' },
          averagePrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalTours: { $count: {} },
          // totalTours: { $sum: 1 },
          totalNumOfRatings: { $sum: '$ratingsQuantity' },
        },
      },
      {
        $sort: { averageRating: 1 },
      },
    ]);
    res.status(200).json({
      status: STATUS.SUCCESS,
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: STATUS.FAIL,
      message: err.message,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numOfTours: { $count: {} },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: {
          numOfTours: -1,
        },
      },
      {
        $limit: 12,
      },
    ]);
    res.status(200).json({
      status: STATUS.SUCCESS,
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: STATUS.FAIL,
      message: err.message,
    });
  }
};
