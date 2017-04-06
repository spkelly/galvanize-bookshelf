'use strict';

const express = require('express');
const knex = require('../knex');
const humps = require('humps');
const boom = require('boom');
// eslint-disable-next-line new-cap
const router = express.Router();

// YOUR CODE HERE

const routeValidator = (req, res, next) => {
  if (isNaN(req.params.id)) {
    next(boom.notFound('Not Found'));
  }
  else {
    next();
  }
};

const bodyValidator = (req, res, next) => {
  if (!req.body.title) {
    next(boom.badRequest('Title must not be blank'));
  }
  else if (!req.body.author) {
    next(boom.badRequest('Author must not be blank'));
  }
  else if (!req.body.genre) {
    next(boom.badRequest('Genre must not be blank'));
  }
  else if (!req.body.description) {
    next(boom.badRequest('Description must not be blank'));
  }
  else if (!req.body.coverUrl) {
    next(boom.badRequest('Cover URL must not be blank'));
  }
  else {
    next();
  }
};

router.get('/', (req, res, next) => {
  knex('books')
  .orderBy('title')
  .then( (data) => {
    res.send(humps.camelizeKeys(data));
  });
});

router.get('/:id', routeValidator,(req, res, next) =>{
  knex('books')
    .where('id', req.params.id)
    .then((data) => {
      if (data.length > 0) {
        res.send(humps.camelizeKeys(data[0]));
      }
      else {
        next(boom.notFound('Not Found'));
      }
    });
});

router.post('/', bodyValidator, (req, res) => {
  const book = humps.decamelizeKeys(req.body);

  knex('books').insert(book)
    .returning(['id', 'title', 'author', 'genre', 'description', 'cover_url'])
    .then((data) => {
      res.send(humps.camelizeKeys(data[0]));
    });
});

router.patch('/:id', routeValidator, (req, res, next) =>{
  const id = req.params.id
  const book = humps.decamelizeKeys(req.body);

  knex('books')
    .where('id', id)
    .update(book)
    .returning('*')
    .then((data) => {
      if(data.length > 0){
        res.send(humps.camelizeKeys(data[0]));
      }
      else{
        next(boom.notFound('Not Found'))
      }
    })
    .catch((err) => next(boom.notFound('Not Found')));
});

router.delete('/:id', routeValidator, (req, res, next) => {
  const id = req.params.id;

  knex('books').where('id', id)
  .select(['title', 'author', 'description', 'genre', 'cover_url'])
  .then((data) => {
    if (data.length > 0) {
      knex('books').where('id', id).del()
      .then(() => {
        res.send(humps.camelizeKeys(data[0]));
      });
    }
    else {
      next(boom.notFound('Not Found'));
    }
  });
});
module.exports = router;
