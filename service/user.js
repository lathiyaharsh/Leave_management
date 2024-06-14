const { user } = require("../model/user");
const fs = require("fs");

module.exports.checkUser = async (email) => {
  try {
    const findUserDetails = await user.findOne({ where: { email } });
    if (findUserDetails) return true;
  } catch (error) {
    console.log(error);
    throw error
  }
};

module.exports.deleteFile = async (file) => {
  try {
    await fs.unlinkSync(file.path);
  } catch (error) {
    console.log(error);
    throw error
  }
};

module.exports.findUserByEmail = async (email) => {
  try {
    const findUserDetails = await user.findOne({ where: { email } });
    if (findUserDetails) return findUserDetails;
  } catch (error) {
    console.log(error);
    throw error
  }
};

module.exports.createUser = async (data) => {
  try {
    const createdUser = await user.create(data);
    return createdUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

module.exports.findUser = async (whereCondition,attributes) => {
  try {
    const foundUser = await user.findOne({ where: whereCondition , attributes});
    if (!foundUser) return false;
    return foundUser;
  } catch (error) {
    console.error("Error finding user:", error);
    throw error
  }
};

module.exports.findAllUsers = async (whereCondition,attributes,offset,limit) => {
  try {
    const allUsers = await user.findAll({ where: whereCondition ,offset,limit, attributes});
    return allUsers;
  } catch (error) {
    console.error("Error finding all users:", error);
    throw error
  }
};

module.exports.updateUser = async (data, whereCondition) => {
  try {
    const [affectedRows] = await user.update(data, {
      where: whereCondition,
      runValidators: true,
    });
    if (affectedRows === 0) return false;
    return affectedRows;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

module.exports.deleteUser = async (whereCondition) => {
  try {
    const deletedRows = await user.destroy({ where: whereCondition });
    if (deletedRows === 0) return false;
    return deletedRows;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error
  }
};

module.exports.countUsers =async (whereCondition) => {
  try {
    const totalUser = await user.count({ where: whereCondition });
    return totalUser;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error
  }
};
