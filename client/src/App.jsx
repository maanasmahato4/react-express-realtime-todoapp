import React, { useEffect, useState } from 'react';
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:4001";

let socket;

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    socket = socketIOClient(ENDPOINT);

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    socket.on("todos", data => {
      setTodos(data);
    });

    return () => socket.off("todos");
  }, []);

  // Handlers for adding, updating and deleting todos
  const handleAdd = () => {
    const todo = { id: Math.random(), task: newTodo, status: 'incomplete' };
    socket.emit('addTodo', todo);
  }

  const handleUpdate = (id) => {
    const todo = todos.find(todo => todo._id === id);
    if (todo.status === 'complete') {
      todo.status = "incomplete"
    }
    else if (todo.status === 'incomplete') {
      todo.status = "complete"
    }
    console.log(todo);
    socket.emit('updateTodo', todo);
  }

  const handleDelete = (id) => {
    socket.emit('deleteTodo', id);
  }

  return (
    <div>
      <input
        type="text"
        value={newTodo}
        onChange={e => setNewTodo(e.target.value)}
      />
      <button onClick={handleAdd}>Add</button>

      <ul>
        {todos.map((todo, idx) =>
          <li key={idx}>
            {todo.task} - {todo.status}
            <button onClick={() => handleUpdate(todo._id)}>
              {todo.status == 'complete' ? 'Mark as incomplete' : 'Mark as complete'}
            </button>
            <button onClick={() => handleDelete(todo._id)}>Delete</button>
          </li>
        )}
      </ul>
    </div>
  );

}

export default App;
