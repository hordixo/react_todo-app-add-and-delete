import React, {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { postTodos, USER_ID } from '../../api/todos';
import { Todo } from '../../types/Todo';

type Props = {
  setError: (message: string) => void;
  setTempTodo: (todo: Todo | null) => void;
  setTodos: Dispatch<SetStateAction<Todo[]>>;
  isPosting: boolean;
  setIsPosting: (value: boolean) => void;
};

export const Header: React.FC<Props> = ({
  setError,
  setTempTodo,
  setTodos,
  isPosting,
  setIsPosting,
}) => {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title should not be empty');

      return;
    }

    const temp = {
      id: 0,
      title,
      completed: false,
      userId: USER_ID,
    };

    setIsPosting(true);
    setTempTodo(temp);

    try {
      const addedTodo = await postTodos({
        title: temp.title,
        userId: temp.userId,
        completed: temp.completed,
      });

      setTodos(prev => [...prev, addedTodo]);
      setTempTodo(null);
      setTitle('');
    } catch {
      setError('Unable to add a todo');
      setTempTodo(null);
    } finally {
      setIsPosting(false);
    }
  };

  useEffect(() => {
    if (!isPosting) {
      inputRef.current?.focus();
    }
  }, [isPosting]);

  return (
    <header className="todoapp__header">
      {/* this button should have `active` class only if all todos are completed */}
      <button
        type="button"
        className="todoapp__toggle-all active"
        data-cy="ToggleAllButton"
      />

      {/* Add a todo on form submit */}
      <form onSubmit={handleSubmit}>
        <input
          value={title}
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          ref={inputRef}
          onChange={e => setTitle(e.target.value)}
          disabled={isPosting}
        />
      </form>
    </header>
  );
};
