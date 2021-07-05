require('dotenv').config();
const express = require("express");
const app = express();
const Note = require('./models/note');


//const cors = require("cors");

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path: ', request.path);
  console.log('Body: ', request.body);
  console.log('---');
  next();
}


app.use(express.static("build"));
app.use(express.json());
app.use(requestLogger);
//app.use(cors());



let notes = [
    {
      id: 1,
      content: "HTML is easy",
      date: "2019-05-30T17:30:31.098Z",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only Javascript",
      date: "2019-05-30T18:39:34.091Z",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      date: "2019-05-30T19:20:14.298Z",
      important: true
    }
];


app.get('/', (request, response) => {
  console.log("HELLLOOO");
  response.send([{hello : 1}]);
});

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes);
  })
});

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
  .then(foundNote => {
    if (foundNote) {
      response.json(foundNote);
    } else {
      response.status(404).end();
    }
  })
  .catch(error => {
    next(error);
  })
});

app.delete('api/notes/:id', (request, response) => {
  Note.findByIdAndRemove(request.params.id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
});

const generateID = () => {
  const maxID = notes.length > 0
  ? Math.max(notes.map(note => note.id))
  : 0;
  return maxID + 1;
}

app.post('/api/notes', (request, response, next) => {
  const body = request.body;
  
  const note = new Note({
    content : body.content,
    important : body.important || false,
    date : new Date(),
    id : generateID()
  });

  note.save()
  .then(savedNote => {
    response.json(note);
  })
  .catch(error => next(error));

});

app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body;

  const note = {
    content : body.content,
    important : body.important
  }

  Note.findByIdAndUpdate(request.params.id, note, {new : true})
  .then(updatedNote => {
    response.json(updatedNote);
  })
  .catch(error => next(error));
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({error : 'unknown endpoint'});
}

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({error : 'malformed id'});
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({error : error.message});
  }
  next(error);
}

app.use(errorHandler);


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});