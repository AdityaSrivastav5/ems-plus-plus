"use client";

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import { useForm } from 'react-hook-form';

const GET_PROJECTS = gql`
  query GetProjects($status: String) {
    projects(status: $status) {
      id
      name
      description
      status
      startDate
      endDate
      createdAt
    }
  }
`;

const CREATE_PROJECT = gql`
  mutation CreateProject($input: ProjectInput!) {
    createProject(input: $input) {
      id
      name
    }
  }
`;

const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

export default function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data, loading, refetch } = useQuery(GET_PROJECTS, {
    fetchPolicy: 'network-only'
  });

  const [createProject] = useMutation(CREATE_PROJECT);
  const [deleteProject] = useMutation(DELETE_PROJECT);

  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (formData: any) => {
    try {
      await createProject({
        variables: {
          input: formData
        }
      });
      toast.success('Project created successfully');
      setIsModalOpen(false);
      reset();
      refetch();
    } catch (error) {
      toast.error('Failed to create project');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject({ variables: { id } });
        toast.success('Project deleted');
        refetch();
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const columns = [
    { key: 'name', label: 'Project Name' },
    { key: 'description', label: 'Description' },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.status === 'active' ? 'bg-green-100 text-green-800' :
          item.status === 'completed' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      )
    },
    { 
      key: 'startDate', 
      label: 'Start Date',
      render: (item: any) => item.startDate ? new Date(parseInt(item.startDate)).toLocaleDateString() : '-'
    },
    { 
      key: 'endDate', 
      label: 'End Date',
      render: (item: any) => item.endDate ? new Date(parseInt(item.endDate)).toLocaleDateString() : '-'
    },
  ];

  return (
    <div className="space-y-6">
      <Toaster />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your team projects</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Project
        </button>
      </div>

      <Table
        columns={columns}
        data={data?.projects || []}
        total={data?.projects?.length || 0}
        page={1}
        pageSize={100}
        onPageChange={() => {}}
        loading={loading}
        actions={(item) => (
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => handleDelete(item.id)}
              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded-lg transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Name</label>
            <input
              {...register('name', { required: true })}
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
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                {...register('startDate')}
                type="date"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                {...register('endDate')}
                type="date"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              {...register('status')}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
            >
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
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
              Create Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
