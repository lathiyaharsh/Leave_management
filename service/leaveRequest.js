const leaveRequest = require("../model/leaveRequest");

module.exports.createLeaveRequest = async (data) => {
  try {
    const createNewLeave = await leaveRequest.create(data);
    if (!createNewLeave) return false;
    return createNewLeave;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports.findLeaveRequest = async (whereCondition) => {
  try {
    const findLeaveRequest = await leaveRequest.findOne({
      where: whereCondition,
    });
    if (!findLeaveRequest) return findLeaveRequest;
    throw error;
  } catch (error) {
    console.error("Error finding leaveRequest:", error);
    throw error;
  }
};

module.exports.updateLeaveRequest = async (whereCondition, data) => {
  try {
    const [affectedRows] = await leaveRequest.update(data, {
      where: whereCondition,
      returning: true,
    });
    if (affectedRows === 0) return false;
    return affectedRows;
  } catch (error) {
    console.error("Error updating leaveRequest:", error);
    throw error;
  }
};

module.exports.findAllLeaveRequest = async (whereCondition,attributes,order,include,offset,limit) => {
  try {
    const leaveRequests = await leaveRequest.findAll({
      where: whereCondition,
      attributes,
      order,
      include,
      offset,
      limit
    });
    if (!leaveRequests) return false;
    return leaveRequests;
  } catch (error) {
    console.error("Error finding leaveRequest:", error);
    throw error;
  }
};

module.exports.countUserLeaveRequest = async (whereCondition) => {
  try {
    
    const foundUserLeave = await leaveRequest.findAndCountAll({
      where: whereCondition,
    });
    if (!foundUserLeave) return false;
    return foundUserLeave;
  } catch (error) {
    console.error("Error finding userLeave:", error);
    throw error;
  }
};
