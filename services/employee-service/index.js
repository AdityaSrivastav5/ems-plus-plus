const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const config = require('@ems/config');

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
    createEmployee(name: String!, email: String!): Employee
  }
`;

const resolvers = {
  Query: {
    employees: () => [],
    employee: () => null,
  },
  Mutation: {
    createEmployee: (_, { name, email }) => ({ id: '1', name, email }),
  },
};

async function startServer() {
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
