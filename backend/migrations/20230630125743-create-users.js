'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [3, 30] // Username must be between 3 and 30 characters long
        }
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          notEmpty: true,
          len: [6, 100] // Password must be between 6 and 100 characters long
        }
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          isEmail: true // Email must be a valid email address
        }
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          is: /^\+?[0-9]{11,}$/ // Phone must be a valid phone number with at least 11 digits
        }
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          isUrl: true // Avatar must be a valid URL
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};
