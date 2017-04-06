'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const knex = require('../knex');
const humps = require('humps');
const boom = require('boom');
// eslint-disable-next-line new-cap
const router = express.Router();

// YOUR CODE HERE

const getIdfromDb = (token) => {
  let decoded = jwt.verify(token, process.env.JWT_KEY);
  return knex('users')
    .where('email', decoded.email)
    .select('id')
    .then((data) => {
      if(data.length){
        return data[0].id
      }
      else{
        throw (boom.badRequest('not a valid user'))
      }
    })
}
const addToFavorites = (userId, bookId) => {
  return knex('favorites')
    .insert({
      'book_id': bookId,
      'user_id': userId
    })
    .returning(['id','user_id','book_id'])
}
const deleteFromFavorites = (userId, bookId) => {
  return knex('favorites')
    .del()
    .where({
      'book_id': bookId,
      'user_id': userId
    })
    .returning(['user_id', 'book_id'])
}
const checkBook = (userId, bookId) =>{
  return  knex('favorites')
    .where({
      'book_id': bookId,
      'user_id': userId
    })
    .then((book) => {
      if (book.length) {
        return true;
      }
      else {
        return false;
      }
    })
}
const getFavorites = (id) => {
  return knex('favorites')
    .where('user_id', id)
    .innerJoin('books', 'favorites.book_id', 'books.id')
}
const checkToken = (req, res, next) => {
  if(!req.cookies.token) {
    next(boom.create(401, 'Unauthorized'))
  }
  else{
    next()
  }
}

router.get('/', checkToken, (req, res, next) =>{
  getIdfromDb(req.cookies.token)
  .then(getFavorites)
  .then((favs) => {
    res.send(humps.camelizeKeys(favs));
  })
  .catch((err) =>{
    next(err);
  })
});

router.get('/check', checkToken, (req, res, next) => {
  var bookId = req.query.bookId;
  getIdfromDb(req.cookies.token)
  .then((userId) =>{
    checkBook(userId, bookId)
    .then((hasBook) =>{
      res.send(hasBook);
    });
  })
});

router.post('/', checkToken, (req, res, next) => {
  let bookId = req.body.bookId;
  getIdfromDb(req.cookies.token)
    .then((userId) =>{
      addToFavorites(userId, bookId)
      .then((data) => {
        res.send(humps.camelizeKeys(data[0]));
      })
    })
    .catch((err) =>{
      next(err);
    })
})

router.delete('/', checkToken, (req, res, next) => {
  let bookId = req.body.bookId;
  getIdfromDb(req.cookies.token)
    .then((userId) =>{
      deleteFromFavorites(userId, bookId)
      .then((data) =>{
        res.send(humps.camelizeKeys(data[0]));
      })
    })
    .catch((err) =>{
      next(err);
    })

})

module.exports = router;
