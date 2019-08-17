const express = require('express');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const bodydparser = require('body-parser');
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');
const db = require('./config/keys').mongoURI;
const passport = require('passport')
const port = process.env.PORT || 5000;

const app = express();
mongoose.connect(db, {useNewUrlParser: true})
        .then(()=> console.log('Connected to DB successfully'))
        .catch(err => console.log(err))
        
// const client = new MongoClient(db, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });


app.use(bodydparser.urlencoded({ extended: false}))
app.use(bodydparser.json())

app.use(passport.initialize())
//require('./config/passport')(passport);
 app.use('/api/users', users);
 app.use('/api/profile', profile);
 app.use('/api/posts', posts);





app.get('/app', (req, res) => { 
    res.send(req.ip);
});

app.listen(port, () => console.log(`listing in port ${ port }`));