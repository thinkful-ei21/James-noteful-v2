'use strict';

const express = require('express');
const knex = require('../knex');

const router = express.Router();


// Get all folders
router.get('/', (req, res, next) => {
    knex.select('id', 'name')
        .from('folders')
        .then(results => {
            res.json(results);
        })
        .catch(err => {
            next(err);
        });
});


// get single folder
router.get('/:id', (req, res, next) => {
    const folder_id = req.params.id;

    knex.select('id', 'name')
        .from('folders')
        .where('id', folder_id)
        .then(result => {
            res.json(result[0]);
        })
        .catch(err => {
            next(err);
        });

});

router.put('/:id', (req, res, next) => {
    const folder_id = req.params.id;

    const updateObj = {};
    const updatableFields = ['name'];

    updatableFields.forEach(field => {
        if (field in req.body) {
            updateObj[field] = req.body[field];
        }
    });

    if (!updateObj.name) {
        const err = new Error('Missing `name` in request body');
        err.status = 400;
        return next(err);
    }

    knex.select('id', 'name')
        .from('folders')
        .where('id', folder_id)
        .update(updateObj)
        .returning(['name'])
        .then(result => {
            res.json(result[0]);
        })
        .catch(err => {
            next(err);
        });
});



module.exports = router;