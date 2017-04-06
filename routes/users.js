'use strict';

const express = require('express');
const knex = require('../knex');
const humps = require('humps');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/', (req, res, next) => {
  const user = humps.decamelizeKeys(req.body);
  const token = jwt.sign(req.body, process.env.JWT_KEY);

  bcrypt.hash(user.password, 8)
    .then((hashed) => {
      knex('users').insert({
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'hashed_password': hashed
      })
      .returning(['id', 'first_name', 'last_name', 'email'])
      .then((data) => {
        res.cookie('token', token, { httpOnly: true });
        res.send(humps.camelizeKeys(data[0]));
      })
      .catch((err) => {
        next(err);
      })
    });
});

module.exports = router;
