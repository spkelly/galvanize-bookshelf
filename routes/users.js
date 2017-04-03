'use strict';

const express = require('express');
const knex = require('../knex');
const humps = require('humps');
const bcrypt = require('bcrypt');

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/', (req,res,next) =>{
  let user = humps.decamelizeKeys(req.body);
  console.log('the user',user);
  console.log('user email',user.email);
  console.log("the users first name",user.first_name);
  bcrypt.hash(user.password,12)
    .then((hashed)=>{
      console.log("hashed password",hashed);
      knex('users').insert({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        hashed_password: hashed
      })
      .returning(['id','first_name','last_name','email'])
      .then((data)=>{
        console.log('made it',data);
        res.send(humps.camelizeKeys(data[0]));
      })

    });
});
// YOUR CODE HERE

module.exports = router;
