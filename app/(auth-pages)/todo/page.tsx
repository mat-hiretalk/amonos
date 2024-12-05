'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

// Define the Todo type based on your table structure
interface Todo {
  id: number;
  created_at: string;
  todo: string;
}

const TodoPage = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const supabase = createClient();

  // Fetch todos on component mount
  useEffect(() => {
    const fetchTodos = async () => {
      const { data, error } = await supabase
        .from('todos')
        .select('*')

      if (error) {
        console.error('Error fetching todos:', error);
        return;
      }
      console.log(data);

      setTodos(data || []);
    };

    fetchTodos();
  }, [supabase]);

  // Add new todo
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const { data, error } = await supabase
      .from('todos')
      .insert([{ todo: newTodo }])
      .select()
      .single();

    if (error) {
      console.error('Error adding todo:', error);
      return;
    }

    setTodos([data, ...todos]);
    setNewTodo('');
  };

  // Delete todo
  const handleDeleteTodo = async (id: number) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting todo:', error);
      return;
    }

    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Todo List</h1>
      
      <form onSubmit={handleAddTodo} className="flex gap-2 mb-6">
        <Input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1"
        />
        <Button type="submit">Add Todo</Button>
      </form>

      <div className="space-y-4">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
          >
            <div className="flex items-center gap-3">
              <Checkbox id={`todo-${todo.id}`} />
              <span>{todo.todo}</span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteTodo(todo.id)}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoPage;
