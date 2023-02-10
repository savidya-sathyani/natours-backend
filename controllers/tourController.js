const Tour = require('../models/tourModel');

const STATUS = {
  SUCCESS: 'success',
  FAIL: 'fail',
  ERROR: 'error',
};

const logTime = (req) => {
  console.log(`LOGGER:: Request time:${req.requestTime}`);
};

class APIFeatures {
  constructor(query, queryString, excludingFields, defaultSortField) {
    this.query = query;
    this.queryString = queryString;
    this.DEFAULT_EXCLUDING_FIELDS = excludingFields || [
      'page',
      'sort',
      'limit',
      'fields',
    ];
    this.DEFAULT_SORT_FIELD = defaultSortField || 'createdAt';
    this.UNNECESSARY_FIELD = '-__v';
  }

  filter() {
    const queryObj = { ...this.queryString };
    this.DEFAULT_EXCLUDING_FIELDS.forEach((item) => delete queryObj[item]);

    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort(this.DEFAULT_SORT_FIELD);
    }
    return this;
  }

  filterFields() {
    if (this.queryString.fields) {
      const selectedFields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(selectedFields);
    } else {
      this.query = this.query.select(this.UNNECESSARY_FIELD);
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skipLimit = (page - 1) * limit;

    this.query = this.query.skip(skipLimit).limit(limit);
    return this;
  }
}

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
