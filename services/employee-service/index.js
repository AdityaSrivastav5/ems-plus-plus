const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { connectDB, mongoose } = require('@ems/shared-lib/db');
const config = require('@ems/config');

// Mongoose Schema
const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: String,
  department: String,
  orgId: String,
  createdAt: { type: Date, default: Date.now }
});

const Employee = mongoose.model('Employee', employeeSchema);

const typeDefs = gql`
  type Employee {
    id: ID!
    name: String!
    email: String!
    role: String
    department: String
  }

  type Query {
    employees: [Employee]
    employee(id: ID!): Employee
  }

  type Mutation {
    createEmployee(name: String!, email: String!, role: String, department: String): Employee
  }
`;

const resolvers = {
  Query: {
    employees: async () => {
      return await Employee.find();
    },
    employee: async (_, { id }) => {
      return await Employee.findById(id);
    },
  },
  Mutation: {
    createEmployee: async (_, { name, email, role, department }) => {
      const employee = new Employee({ name, email, role, department });
      return await employee.save();
    },
  },
};

async function startServer() {
  await connectDB();
  
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4004;
  app.listen(PORT, () => {
    console.log(`Employee Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
