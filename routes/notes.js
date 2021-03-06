'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

const knex = require('../knex');

// Get All (and search by query)
router.get('/', (req, res, next) => {
    const { searchTerm } = req.query;
    const { folderId } = req.query;
    
    
    knex
        .select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .modify(queryBuilder => {
            if (searchTerm) {
                queryBuilder.where('title', 'like', `%${searchTerm}%`);
            }
        })
        .modify(queryBuilder => {
            if (folderId) {
                queryBuilder.where('folder_id', folderId);
            }
        })
        .orderBy('notes.id')
        .then(results => {
            res.json(results);
        })
        .catch(err => {
            next(err);
        });
});

// Get a single item
router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    // const folderId  = req.params.folderId;

    knex
        .select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', id)
        .then(result =>{
            res.json(result[0]);
        })    
        .catch(err => { 
            next(err);
        });
});

// Put update an item
router.put('/:id', (req, res, next) => {
    const id = req.params.id;

    const updateObj = {
        title: req.body.title,
        content: req.body.content,
        folder_id: req.body.folderId
    };
    
    let noteId;
    
    knex
        .from('notes')
        .where('notes.id', id)
        .update(updateObj) 
        .returning('id')
        .then(([id]) => {
            noteId = id;
            return knex.select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName')
                .from('notes')
                .leftJoin('folders', 'notes.folder_id', 'folders.id')
                .where('notes.id', noteId); 
        })
        .then(([result]) => {
            res.location(`${req.originalUrl}/${result.id}`).status(201).json(result); 
        })
        .catch(err => {
            next(err);
        });
});

// Post (insert) an item
router.post('/', (req, res, next) => {
    const { title, content, folderId } = req.body;

    const newItem = { 
        title: title,
        content: content,
        folder_id: folderId 
    };

    /***** Never trust users - validate input *****/
    if (!newItem.title) {
        const err = new Error('Missing `title` in request body');
        err.status = 400;
        return next(err);
    }

    let noteId;



    knex.insert(newItem)
        .into('notes')
        .returning('id')
        .then(([id]) => {
            // Using the new Id, select the new note and folder
            noteId = id;
            return knex.select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName')
                .from('notes')
                .leftJoin('folders', 'notes.folder_id', 'folders.id')
                .where('notes.id', noteId);
        })
        .then(([result]) => {
            res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
        })
        .catch(err => {
            next(err);
        });
});

// Delete an item
router.delete('/:id', (req, res, next) => {
    const id = req.params.id;

    knex
        .del()
        .from('notes')
        .where('id', id)
        .then(result => {
            res.sendStatus(204);
        })
        .catch(err => {
            next(err);
        });
});

module.exports = router;
