// routes for folders
const express = require('express');
const router = express.Router();
const {
    createFolder,
    getMyFolders,
    getFolderById,
    updateFolderById,
    deleteFolderById,
    getFolderByName
} = require('../controllers/folder-controllers');

// middleware for authentication
const checkAuth = require('../middlewares/auth');

router.post('/create', checkAuth, createFolder);

router.get('/my-folders', checkAuth, getMyFolders);

// get a folder by id
router.get('/:folderId', checkAuth, getFolderById);

// update a folder by id
router.put('/:folderId', checkAuth, updateFolderById);

// delete a folder by id
router.delete('/:folderId', checkAuth, deleteFolderById);

// get a folder by name (case-insensitive search)
router.get('/name/:folderName', checkAuth, getFolderByName);

// Create a subfolder within an existing folder
router.post('/create-subfolder/:parentFolderId', checkAuth, createFolder);

// Fetch nested folders and their children recursively
router.get('/nested/:folderId', checkAuth, getFolderById);


module.exports = router;