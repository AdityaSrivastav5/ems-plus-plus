"use client";

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';
import KanbanBoard from '@/components/KanbanBoard';
import Modal from '@/components/Modal';
import { useForm } from 'react-hook-form';

const GET_TASKS = gql`
  query GetTasks($projectId: ID) {
    tasks(projectId: $projectId) {
      id
      title
      description
      status
      priority
      dueDate
      project {
        id
        name
      }
    }
    projects {
      id
      name
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($input: TaskInput!) {
    createTask(input: $input) {
      id
      title
      status
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $input: TaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      status
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

const STAGES = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

export default function TaskBoardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  
  const { data, loading, refetch } = useQuery(GET_TASKS, {
    variables: { projectId: selectedProject || undefined },
    fetchPolicy: 'network-only'
  });

  const [createTask] = useMutation(CREATE_TASK);
  const [updateTask] = useMutation(UPDATE_TASK);
  const [deleteTask] = useMutation(DELETE_TASK);

  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (formData: any) => {
    try {
      await createTask({
        variables: {
          input: {
            ...formData,
            status: 'todo' // Default status
          }
        }
      });
      toast.success('Task created successfully');
      setIsModalOpen(false);
      reset();
      refetch();
    } catch (error) {
      toast.error('Failed to create task');
      console.error(error);
    }
  };

  const handleDragEnd = async (activeId: string, newStatus: string) => {
    try {
      await updateTask({ 
        variables: { 
          id: activeId, 
          input: { status: newStatus } 
        } 
      });
      toast.success('Task moved');
      refetch();
    } catch (error) {
      toast.error('Failed to move task');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask({ variables: { id } });
        toast.success('Task deleted');
        refetch();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <Toaster />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
          <p className="text-sm text-gray-500 mt-1">Manage tasks and sprints</p>
        </div>
        <div className="flex gap-4">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl"
          >
            <option value="">All Projects</option>
            {data?.projects?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Task
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <KanbanBoard
            columns={STAGES}
            items={data?.tasks || []}
            onDragEnd={handleDragEnd}
            renderItem={(task) => (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900 pr-6">{task.title}</h4>
                  <button 
                    onClick={(e) => handleDelete(e, task.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${
                    task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                  {task.project && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded truncate max-w-[120px]">
                      {task.project.name}
                    </span>
                  )}
                </div>
                
                {task.dueDate && (
                  <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500">
                    Due: {new Date(parseInt(task.dueDate)).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Task"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Task Title</label>
            <input
              {...register('title', { required: true })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Project</label>
              <select
                {...register('projectId')}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
              >
                <option value="">No Project</option>
                {data?.projects?.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                {...register('priority')}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              {...register('dueDate')}
              type="date"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
            />
          </div>

          <div className="mt-5 sm:mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:text-sm"
            >
              Create Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
