// controllers for folder

// import the required modules
const folderModel = require('../models/folder-model');
const userModel = require('../models/user-model');
const {Sequelize} = require("sequelize");

// Create a new folder
exports.createFolder = async (req, res, next) => {
    try {
        // Get the folder data from request body
        const { folderName, folderDescription } = req.body;

        // Get the user id from request object
        const userId = req.user.id;

        // Get the parent folder id from request params (for subfolders)
        const parentFolderId = req.params.parentFolderId;

        // Validate the folder data
        if (!userId || !folderName) {
            return res.status(400).json({
                message: 'Invalid data'
            });
        }

        // Check if the folder already exists for the user
        const existingFolder = await folderModel.findOne({
            where: {
                userId: userId,
                folderName: folderName
            }
        });

        if (existingFolder) {
            return res.status(400).json({
                message: 'Folder already exists'
            });
        }

        // Create a new folder
        const newFolder = await folderModel.create({
            userId,
            folderName,
            folderDescription
        });

        // If a parent folder ID is provided, update the parent folder relationship
        if (parentFolderId) {
            const parentFolder = await folderModel.findByPk(parentFolderId);
            if (!parentFolder) {
                return res.status(404).json({
                    message: 'Parent folder not found'
                });
            }
            newFolder.parentFolderId = parentFolderId;
            await newFolder.save();
        }

        // Return the new folder
        return res.status(201).json({
            message: 'Folder created successfully',
            folder: newFolder
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: e.message
        });
    }
};


// get all my folders
exports.getMyFolders = async (req, res, next) => {
    try {
        // get the user id from request object
        const userId = req.user.id;

        // get all top-level folders of the user
        const topLevelFolders = await folderModel.findAll({
            where: {
                userId: userId,
                parentFolderId: null // Only fetch top-level folders (folders without parentFolderId)
            },
            include: {
                model: folderModel,
                as: 'children', // Name of the association in the model
                nested: true // Enable nested eager loading
            }
        });

        // return the folders
        return res.status(200).json({
            message: 'Folders fetched successfully',
            folders: topLevelFolders
        });
    } catch (e) {
        console.error('Error while fetching folders:', e);
        return res.status(500).json({
            message: 'An error occurred while fetching folders'
        });
    }
};

// get a folder by id
exports.getFolderById = async (req, res) => {
    try {
        // get the folder id from request params
        const folderId = req.params.folderId;

        // get the folder by id, including nested children folders
        const folder = await folderModel.findByPk(folderId, {
            include: {
                model: folderModel,
                as: 'children', // Name of the association in the model
                nested: true // Enable nested eager loading
            }
        });

        // if the folder is not found
        if (!folder) {
            return res.status(404).json({
                message: 'Folder not found'
            });
        }

        // return the folder
        return res.status(200).json({
            message: 'Folder fetched successfully',
            folder: folder
        });
    } catch (e) {
        console.error('Error while fetching folder:', e);
        return res.status(500).json({
            message: 'An error occurred while fetching the folder'
        });
    }
};

// update a folder by id
exports.updateFolderById = async (req, res) => {
    try {
        // get the folder id from request params
        const folderId = req.params.folderId;

        // get the folder data from request body
        const { folderName, folderDescription, parentFolderId } = req.body;

        // get the folder by id
        const folder = await folderModel.findByPk(folderId);

        // if the folder is not found
        if (!folder) {
            return res.status(404).json({
                message: 'Folder not found',
            });
        }

        // make sure the user is the owner of the folder
        if (folder.userId !== req.user.id) {
            return res.status(403).json({
                message: 'You are not authorized to update this folder',
            });
        }

        // Update the folder properties if they are provided in the request body
        if (folderName !== undefined) {
            folder.folderName = folderName;
        }
        if (folderDescription !== undefined) {
            folder.folderDescription = folderDescription;
        }
        if (parentFolderId !== undefined) {
            // Check if the specified parentFolderId exists and belongs to the same user
            const parentFolder = await folderModel.findOne({
                where: {
                    id: parentFolderId,
                    userId: req.user.id,
                },
            });

            if (!parentFolder) {
                return res.status(400).json({
                    message: 'Invalid parent folder id',
                });
            }

            folder.parentFolderId = parentFolderId;
        }

        // Save the folder changes
        await folder.save();

        // return the updated folder
        return res.status(200).json({
            message: 'Folder updated successfully',
            folder: folder,
        });
    } catch (e) {
        console.error('Error while updating folder:', e);
        return res.status(500).json({
            message: 'An error occurred while updating the folder',
        });
    }
};

// Helper function to recursively delete a folder and its subfolders
async function deleteFolderAndSubFolders(folder) {
    const subFolders = await folderModel.findAll({
        where: {
            parentFolderId: folder.id,
        },
    });

    // Delete all subFolders first
    for (const subFolder of subFolders) {
        await deleteFolderAndSubFolders(subFolder);
    }

    // Delete the current folder
    await folder.destroy();
}

// delete a folder by id
exports.deleteFolderById = async (req, res) => {
    try {
        // get the folder id from request params
        const folderId = req.params.folderId;

        // get the folder by id
        const folder = await folderModel.findByPk(folderId);

        // if the folder is not found
        if (!folder) {
            return res.status(404).json({
                message: 'Folder not found',
            });
        }

        // make sure the user is the owner of the folder
        if (folder.userId !== req.user.id) {
            return res.status(403).json({
                message: 'You are not authorized to delete this folder',
            });
        }

        // Delete the folder and its subFolders recursively
        await deleteFolderAndSubFolders(folder);

        // return success message
        return res.status(200).json({
            message: 'Folder and its subFolders deleted successfully',
        });
    } catch (e) {
        console.error('Error while deleting folder:', e);
        return res.status(500).json({
            message: 'An error occurred while deleting the folder',
        });
    }
};

// search folder by name of current user
exports.getFolderByName = async (req, res) => {
    try {
        // Get the user id from request object
        const userId = req.user.id;

        // Get the folder name from request params (convert to lowercase for case-insensitive search)
        const folderName = req.params.folderName.toLowerCase();


        // Check if the folder name is provided in the request
        if (!folderName) {
            return res.status(400).json({
                message: 'Please provide a folder name to search for',
            });
        }

        // Get all folders of the user with case-insensitive search using LIKE
        const folders = await folderModel.findAll({
            where: {
                userId: userId,
                folderName: Sequelize.literal(`LOWER(folderName) LIKE '%${folderName}%'`),
            },
            // Limit the number of results returned (optional)
            limit: 10,
        });

        // Check if any folders are found
        if (folders.length === 0) {
            return res.status(404).json({
                message: 'No folders found with the provided name',
            });
        }

        // Return the folders
        return res.status(200).json({
            message: 'Folders fetched successfully',
            folders: folders,
        });
    } catch (e) {
        console.error('Error while searching for folders:', e);
        return res.status(500).json({
            message: 'An error occurred while fetching folders',
        });
    }
};