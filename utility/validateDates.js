const moment = require("moment");
const validateDates = (dates) => {
  const today = moment();
  const start = moment(dates.startDate, "YYYY-MM-DD");
  const end = moment(dates.endDate, "YYYY-MM-DD");

  if (start.isBefore(today)) {
    return { valid: false, message: "Start date cannot be in the past." };
  }

  if (end.isBefore(today)) {
    return { valid: false, message: "End date cannot be in the past." };
  }

  if(start.isSame(end)){
    return { valid: true };
  }

  if (end.isBefore(start)) {
    return { valid: false, message: "End date cannot be before start date." };
  }
 
  return { valid: true };
};

module.exports = validateDates;
