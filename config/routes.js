const axios = require('axios');
const bcrypt = require('bcryptjs');
const db = require('../database/dbConfig');

const { authorize } = require('../auth/authorization');
const tokenService = require('../auth/tokenService');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authorize, getJokes);
};

function register(req, res) {
  const user = req.body

  user.password = bcrypt.hashSync(user.password, 7)

  db('users')
  .insert(user)
  .then(user => {
    res.status(201).json(user)
  })
  .catch(err => console.log(err))
}

function login(req, res) {
  const {username, password} = req.body

  db('users')
  .where({username})
  .first()
  .then(user => {
    if(user && bcrypt.compareSync(password, user.password)) {

      const token = tokenService.generateToken(user)
      res.status(201).json({token})
    }
  })
  .catch(err => console.log(err))
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
