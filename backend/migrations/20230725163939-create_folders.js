'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Folders', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            folderName: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [2, 100], // Folder name must be between 2 and 100 characters long
                },
            },
            folderDescription: {
                type: Sequelize.STRING,
                allowNull: true,
                validate: {
                    len: [0, 255] // Folder description must be between 0 and 255 characters long
                }
            },
            parentFolderId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Folders',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
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

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Folders');
    }
};
