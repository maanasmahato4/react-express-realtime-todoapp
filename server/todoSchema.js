const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
    task: String,
    status: String
});

const Todo = mongoose.model('task', TodoSchema);

module.exports = { Todo };