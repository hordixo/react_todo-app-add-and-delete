/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
// import { client } from './utils/fetchClient';
import { Todo } from './types/Todo';
import { Header } from './components/Header';
import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';
import { Loader } from './components/Loader/Loader';
import { deleteTodo, getTodos, USER_ID } from './api/todos';

type Filter = 'all' | 'active' | 'completed';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<Filter>('all');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    getTodos()
      .then(data => {
        setTodos(data);
        setIsLoading(false);
      })
      .catch(() => {
        setErrorMessage('Unable to load todos');
      });
  }, []);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setErrorMessage('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [errorMessage]);

  const visibleTodos = todos.filter(todo => {
    switch (filterStatus) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      default:
        return true;
    }
  });

  const completedTodos = todos.filter(todo => todo.completed);

  const handleDeleteTodo = async (id: number) => {
    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch {
      setErrorMessage('Unable to delete a todo');
    }
  };

  const handleDeleteCompletedTodo = async () => {
    try {
      await Promise.all(completedTodos.map(todo => deleteTodo(todo.id)));
      setTodos(prev => prev.filter(todo => !todo.completed));
    } catch {
      setErrorMessage('Unable to delete completed todos');
    }
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          setError={setErrorMessage}
          setTempTodo={setTempTodo}
          setTodos={setTodos}
          isPosting={isPosting}
          setIsPosting={setIsPosting}
        />
        {isLoading && <Loader />}
        {todos.length > 0 && !isLoading && (
          <TodoList
            todos={visibleTodos}
            tempTodo={tempTodo}
            handleDeleteTodo={handleDeleteTodo}
            isPosting={isPosting}
          />
        )}
        {/* Hide the footer if there are no todos */}
        {todos.length > 0 && (
          <Footer
            todos={todos}
            setFilterStatus={setFilterStatus}
            handleDeleteCompletedTodo={handleDeleteCompletedTodo}
          />
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={`
        notification is-danger is-light has-text-weight-normal ${errorMessage ? '' : 'hidden'}
        `}
      >
        <button data-cy="HideErrorButton" type="button" className="delete" />
        {errorMessage}
        {/* Unable to load todos
        <br />
        Title should not be empty
        <br />
        Unable to add a todo
        <br />
        Unable to delete a todo
        <br />
        Unable to update a todo */}
      </div>
    </div>
  );
};
