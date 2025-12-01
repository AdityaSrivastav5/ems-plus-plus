const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { connectDB, mongoose } = require('@ems/shared-lib/db');
const config = require('@ems/config');

// Mongoose Schema
const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: String,
  department: String,
  phone: String,
  status: { type: String, default: 'active' },
  joinDate: { type: Date, default: Date.now },
  salary: Number,
  orgId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Employee = mongoose.model('Employee', employeeSchema);

const typeDefs = gql`
  type Employee {
    id: ID!
    name: String!
    email: String!
    role: String
    department: String
    phone: String
    status: String!
    joinDate: String
    salary: Float
    orgId: String!
    createdAt: String
    updatedAt: String
  }

  input EmployeeInput {
    name: String!
    email: String!
    role: String
    department: String
    phone: String
    salary: Float
    joinDate: String
  }

  input EmployeeUpdateInput {
    name: String
    email: String
    role: String
    department: String
    phone: String
    salary: Float
    status: String
  }

  type EmployeesResponse {
    employees: [Employee!]!
    total: Int!
    page: Int!
    pageSize: Int!
  }

  type Query {
    employees(page: Int, pageSize: Int, search: String, department: String): EmployeesResponse!
    employee(id: ID!): Employee
  }

  type Mutation {
    createEmployee(input: EmployeeInput!): Employee!
    updateEmployee(id: ID!, input: EmployeeUpdateInput!): Employee!
    deleteEmployee(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    employees: async (_, { page = 1, pageSize = 10, search, department }, context) => {
      if (!context.orgId) {
        throw new Error('Organization ID is required');
      }

      const query = { orgId: context.orgId };
      
      // Add search filter
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { role: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Add department filter
      if (department) {
        query.department = department;
      }

      const total = await Employee.countDocuments(query);
      const employees = await Employee.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize);

      return {
        employees,
        total,
        page,
        pageSize
      };
    },
    
    employee: async (_, { id }, context) => {
      const employee = await Employee.findById(id);
      
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      if (employee.orgId !== context.orgId) {
        throw new Error('Unauthorized');
      }
      
      return employee;
    },
  },
  
  Mutation: {
    createEmployee: async (_, { input }, context) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }
      
      if (!context.orgId) {
        throw new Error('Organization ID is required');
      }

      const employee = new Employee({
        ...input,
        orgId: context.orgId,
        status: 'active'
      });

      return await employee.save();
    },

    updateEmployee: async (_, { id, input }, context) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }

      const employee = await Employee.findById(id);
      
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      if (employee.orgId !== context.orgId) {
        throw new Error('Unauthorized');
      }

      Object.assign(employee, input);
      employee.updatedAt = new Date();
      
      return await employee.save();
    },

    deleteEmployee: async (_, { id }, context) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }

      const employee = await Employee.findById(id);
      
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      if (employee.orgId !== context.orgId) {
        throw new Error('Unauthorized');
      }

      await Employee.findByIdAndDelete(id);
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
      const orgId = req.headers['x-org-id'];
      return { userId, orgId };
    }
  });
  
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4004;
  app.listen(PORT, () => {
    console.log(`Employee Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
