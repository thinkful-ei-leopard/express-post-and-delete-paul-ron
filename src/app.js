require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const uuid = require('uuid/v4');
const helmet = require('helmet');
const cors = require('cors');
const { NODE_ENV } = require('./config');


const app = express();

const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(express.json());
app.use(cors());

const addresses = ['lol'];

app.get('/address', (req, res, next) => { // eslint-disable-line no-unused-vars
  res.send(addresses);
});

app.post('/address', (req, res) => {
  let { firstName, lastName, address1, address2 = '', city, state, zip } = req.body;
  // the user should NOT send at id, it will be auto generated by the server
  if (req.body.id) {
    res.status(400).send('don\'t send ID!');
  }
  // all parameters are required except address2 (and id shouldn't be sent)
  if (!firstName || !lastName || !address1 || !city || !state || !zip) {
    return res.status(400).send('first name, last name, address1, city, state and zip are required');
  }

  if (state.length !== 2) {
    return res.status(400).send('state must be exactly 2 characters');
  }

  if (zip.length !== 5) {
    return res.status(400).send('zip code must be 5 digits');
  }
  
  // We convert zip to an int here because numbers don't have a length property
  zip = parseInt(zip);
  if(isNaN(zip)) {
    return res.status(400).send('zip code must be a number');
  }

  const id = uuid();
  const newAddress = {
    id,
    firstName,
    lastName,
    address1,
    address2,
    city,
    state,
    zip
  };

  addresses.push(newAddress);
  
  res.send('Information successfully submitted');

});

app.use(function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error'}};
  } else {
    console.error(error);
    response = { message: error.message, error};
  }
  res.status(500).json(response);
});

module.exports = app;