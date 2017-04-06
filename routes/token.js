'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const boom = require('boom');
const knex = require('../knex.js');
const humps = require('humps');

require('dotenv').config();

// eslint-disable-next-line new-cap

const router = express.Router();

// YOUR CODE HERE

const verifyUser = (data, password) => {
  return bcrypt.compare(password, data[0].hashed_password);
};

const checkDbForUser = (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    res.end();
  }

  const email = req.body.email;
  const password = req.body.password;

  knex('users')
    .select('id', 'first_name', 'hashed_password', 'last_name', 'email')
    .where('email', email)
    .then((data) => {
      if (data.length) {
        verifyUser(data, password)
        .then((verified) => {
          if (verified) {
            next();
          }
          else {
            next(boom.badRequest('Bad email or password'));
          }
        });
      }
      else {
        next(boom.badRequest('Bad email or password'));
      }
    })
    .catch((err) => next(err));
};

router.get('/', (req, res, next) => {
  if (!req.cookies.token) {
    res.send(false);
  }
  res.send(true);
});

router.post('/', checkDbForUser, (req, res, next) => {
  const token = jwt.sign(req.body, process.env.JWT_KEY);

  res.cookie('token', token, { httpOnly: true });
  knex('users')
    .where('email', req.body.email)
    .select('first_name', 'last_name', 'id', 'email')
    .then((data) => {
      res.send(humps.camelizeKeys(data[0]));
    })
    .catch((err) => next(err));
});

router.delete('/', (req, res, next) => {
  res.clearCookie('token');
  res.status('200');
  res.send(true);
});

module.exports = router;
