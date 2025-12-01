const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { connectDB, mongoose } = require('@ems/shared-lib/db');
const config = require('@ems/config');

// Mongoose Schemas
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  status: { type: String, default: 'active' }, // active, completed, on-hold
  startDate: Date,
  endDate: Date,
  managerId: String,
  teamIds: [String],
  orgId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  assigneeId: String,
  status: { type: String, default: 'todo' }, // todo, in-progress, review, done
  priority: { type: String, default: 'medium' }, // low, medium, high, urgent
  dueDate: Date,
  orgId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const timesheetSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  hours: { type: Number, required: true },
  description: String,
  orgId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', projectSchema);
const Task = mongoose.model('Task', taskSchema);
const Timesheet = mongoose.model('Timesheet', timesheetSchema);

const typeDefs = gql`
  scalar Date

  type Project {
    id: ID!
    name: String!
    description: String
    status: String!
    startDate: String
    endDate: String
    managerId: String
    teamIds: [String]
    createdAt: String
  }

  type Task {
    id: ID!
    title: String!
    description: String
    projectId: ID
    project: Project
    assigneeId: String
    status: String!
    priority: String!
    dueDate: String
    createdAt: String
  }

  type Timesheet {
    id: ID!
    taskId: ID
    task: Task
    userId: String!
    date: String!
    hours: Float!
    description: String
    createdAt: String
  }

  input ProjectInput {
    name: String!
    description: String
    status: String
    startDate: String
    endDate: String
    managerId: String
    teamIds: [String]
  }

  input TaskInput {
    title: String!
    description: String
    projectId: ID
    assigneeId: String
    status: String
    priority: String
    dueDate: String
  }

  input TimesheetInput {
    taskId: ID
    date: String!
    hours: Float!
    description: String
  }

  type Query {
    projects(status: String): [Project!]!
    project(id: ID!): Project
    
    tasks(projectId: ID, assigneeId: String, status: String): [Task!]!
    task(id: ID!): Task
    
    timesheets(userId: String, startDate: String, endDate: String): [Timesheet!]!
  }

  type Mutation {
    createProject(input: ProjectInput!): Project!
    updateProject(id: ID!, input: ProjectInput!): Project!
    deleteProject(id: ID!): Boolean!
    
    createTask(input: TaskInput!): Task!
    updateTask(id: ID!, input: TaskInput!): Task!
    deleteTask(id: ID!): Boolean!
    
    createTimesheet(input: TimesheetInput!): Timesheet!
    deleteTimesheet(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    projects: async (_, { status }, context) => {
      const query = { orgId: context.orgId };
      if (status) query.status = status;
      return await Project.find(query).sort({ createdAt: -1 });
    },
    project: async (_, { id }) => await Project.findById(id),
    
    tasks: async (_, { projectId, assigneeId, status }, context) => {
      const query = { orgId: context.orgId };
      if (projectId) query.projectId = projectId;
      if (assigneeId) query.assigneeId = assigneeId;
      if (status) query.status = status;
      return await Task.find(query).populate('projectId').sort({ createdAt: -1 });
    },
    task: async (_, { id }) => await Task.findById(id).populate('projectId'),
    
    timesheets: async (_, { userId, startDate, endDate }, context) => {
      const query = { orgId: context.orgId };
      if (userId) query.userId = userId;
      if (startDate && endDate) {
        query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
      return await Timesheet.find(query).populate('taskId').sort({ date: -1 });
    },
  },
  
  Task: {
    project: async (parent) => {
      if (parent.projectId) return await Project.findById(parent.projectId);
      return null;
    }
  },

  Timesheet: {
    task: async (parent) => {
      if (parent.taskId) return await Task.findById(parent.taskId);
      return null;
    }
  },
  
  Mutation: {
    createProject: async (_, { input }, context) => {
      const project = new Project({ ...input, orgId: context.orgId });
      return await project.save();
    },
    updateProject: async (_, { id, input }) => {
      return await Project.findByIdAndUpdate(id, input, { new: true });
    },
    deleteProject: async (_, { id }) => {
      await Project.findByIdAndDelete(id);
      return true;
    },
    
    createTask: async (_, { input }, context) => {
      const task = new Task({ ...input, orgId: context.orgId });
      return await task.save();
    },
    updateTask: async (_, { id, input }) => {
      return await Task.findByIdAndUpdate(id, input, { new: true });
    },
    deleteTask: async (_, { id }) => {
      await Task.findByIdAndDelete(id);
      return true;
    },
    
    createTimesheet: async (_, { input }, context) => {
      const timesheet = new Timesheet({ 
        ...input, 
        userId: context.userId,
        orgId: context.orgId 
      });
      return await timesheet.save();
    },
    deleteTimesheet: async (_, { id }) => {
      await Timesheet.findByIdAndDelete(id);
      return true;
    },
  },
};

async function startServer() {
  await connectDB();
  
  const app = express();
  const server = new ApolloServer({ 
    typeDefs, 
    resolvers,
    context: ({ req }) => {
      const userId = req.headers['x-user-id'];
      const orgId = req.headers['x-org-id'] || 'org-1';
      return { userId, orgId };
    }
  });
  
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4008;
  app.listen(PORT, () => {
    console.log(`Task Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
