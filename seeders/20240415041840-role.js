"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("roles", [
      {
        name: "admin",
        priority: "1",
      },
      {
        name: "hod",
        priority: "2",
      },
      {
        name: "faculty",
        priority: "3",
      },
      {
        name: "student",
        priority: "4",
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("roles", null, {});
  },
};
