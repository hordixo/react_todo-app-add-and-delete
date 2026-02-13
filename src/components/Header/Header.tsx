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
  isProcessing: boolean;
};

export const Header: React.FC<Props> = ({
  setError,
  setTempTodo,
  setTodos,
  isPosting,
  setIsPosting,
  isProcessing,
}) => {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Title should not be empty');

      return;
    }

    const temp = {
      id: 0,
      title: trimmedTitle,
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
      setTitle('');
    } catch {
      setError('Unable to add a todo');
      setTempTodo(null);
    } finally {
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsPosting(false);
      setTempTodo(null);
    }
  };

  useEffect(() => {
    if (!isPosting) {
      inputRef.current?.focus();
    }
  }, [isPosting]);

  useEffect(() => {
    if (!isProcessing) {
      inputRef.current?.focus();
    }
  }, [isProcessing]);

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
