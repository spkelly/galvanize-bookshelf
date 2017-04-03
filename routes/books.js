'use strict';

const express = require('express');
const knex = require('../knex');
const humps = require('humps');
// eslint-disable-next-line new-cap
const router = express.Router();

// YOUR CODE HERE

router.get('/', (req, res) => {
  knex('books')
  .orderBy('title')
  .then( (data) => {
    res.send(humps.camelizeKeys(data));
  });
});

router.get('/:id', (req, res) =>{
  knex('books')
    .where('id', req.params.id)
    .then((data) => {
      res.send(humps.camelizeKeys(data[0]));
    });
});

router.post('/', (req,res) => {
  let book = humps.decamelizeKeys(req.body);
  knex('books').insert(book)
    .returning(['id', 'title', 'author', 'genre', 'description', 'cover_url'])
    .then((data) =>{
      res.send(humps.camelizeKeys(data[0]));
    })
});

router.patch('/:id',(req,res) =>{
  let id = req.params.id
  let book = humps.decamelizeKeys(req.body);
  knex('books')
    .where('id', id)
    .update(book)
    .returning('*')
    .then((data) => {
      res.send(humps.camelizeKeys(data[0]));
    });
});

router.delete('/:id', (req, res) =>{
  let id = req.params.id;
  knex('books').where('id', id)
  .select(['title','author','description','genre','cover_url'])
  .then((data) => {
    knex('books').where('id', id).del()
    .then((row) =>{
      res.send(humps.camelizeKeys(data[0]));
    })
  })
});
module.exports = router;
