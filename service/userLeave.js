const userLeave = require("../model/userLeave");

module.exports.createUserLeave = async (data) => {
    try {
        const createdUserLeave = await userLeave.create(data);
        return createdUserLeave;
    } catch (error) {
        console.error('Error creating userLeave:', error);
        throw error; 
    }
}

module.exports.updateUserLeave = async (data, whereCondition) => {
    try {
        const [affectedRows] = await userLeave.update(data, { where: whereCondition });
        if (affectedRows === 0) {
            throw new Error('No userLeaves updated');
        }
        return affectedRows;
    } catch (error) {
        console.error('Error updating userLeave:', error);
        throw error;
    }
}


module.exports.findUserLeave = async (whereCondition,attributes) => {
    try {
        const foundUserLeave = await userLeave.findOne({ where: whereCondition ,attributes});
        if (!foundUserLeave) return false;
        return foundUserLeave;
    } catch (error) {
        console.error('Error finding userLeave:', error);
        throw error;
    }
}

module.exports.countUserLeave= async() => {
    try {
        const countUserLeave = await userLeave.count({});
        if (!countUserLeave) return false;
        return countUserLeave;
    } catch (error) {
        console.error('Error finding userLeave:', error);
        throw error;
    }
}

module.exports.findAllUserLeave = async(attributes,order,include,offset,limit) =>{
    try {
        const userLeaves = await userLeave.findAll({attributes,order,include,offset,limit});
        if (!userLeaves) return false;
        return userLeaves;
    } catch (error) {
        console.error('Error finding userLeave:', error);
        throw error;
    }
}