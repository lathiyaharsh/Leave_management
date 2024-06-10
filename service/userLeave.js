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


module.exports.findUserLeave = async (whereCondition) => {
    try {
        const foundUserLeave = await userLeave.findOne({ where: whereCondition });
        if (foundUserLeave) {
            return foundUserLeave;
        } else {
            throw new Error('UserLeave not found');
        }
    } catch (error) {
        console.error('Error finding userLeave:', error);
        throw error;
    }
}