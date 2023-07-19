const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { Todo } = require("./todoSchema");

let todos = []; // In-memory data storage for simplicity
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://maanas:mahato@cluster0.fon9sup.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("Connected to MongoDB");
});

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
    //console.log('New client connected');

    // Send the existing todos to the client
    Todo.find({})
        .then(result => {
            todos = result.map(r => r.toObject());
            io.emit('todos', todos);
        })
        .catch(error => console.error(error));

    // Handle 'addTodo' event
    socket.on('addTodo', (todo) => {
        const newTodo = new Todo({ task: todo.task, status: 'incomplete' });
        newTodo.save()
            .then(() => {
                Todo.find({})
                    .then(result => {
                        todos = result.map(r => r.toObject());
                        io.emit('todos', todos);
                    })
                    .catch(error => console.error(error));
            })
            .catch((err) => { console.error("Failed to save todo to db: ", err); });
    });


    // Handle 'updateTodo' event
    socket.on('updateTodo', (updatedTodo) => {
        Todo.findByIdAndUpdate(updatedTodo._id, { status: updatedTodo.status }, { new: true })
            .then(() => {
                Todo.find({})
                    .then(result => {
                        todos = result.map(r => r.toObject());
                        io.emit('todos', todos);
                    })
                    .catch((error) => console.error(error));
            })
            .catch((err) => { console.error("Failed to update todo in db: ", err); });
        console.log("Todo updated in db");
    });

    // Handle 'deleteTodo' event
    socket.on('deleteTodo', (id) => {
        Todo.findByIdAndDelete(id)
            .then(() => {
                Todo.find({})
                    .then(result => {
                        todos = result.map(r => r.toObject());
                        io.emit('todos', todos);
                    })
                    .catch(error => console.error(error));
            })
            .catch((err) => { console.error("Failed to delete todo from db: ", err); });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(4001, () => console.log(`Server listening on port 4001`));
