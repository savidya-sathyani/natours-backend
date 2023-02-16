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

module.exports = APIFeatures;
