const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const config = require('@ems/config');

const typeDefs = gql`
  type Asset {
    id: ID!
    name: String!
    type: String!
    serialNumber: String
    assignedTo: ID
  }

  type Query {
    assets: [Asset]
    asset(id: ID!): Asset
  }

  type Mutation {
    createAsset(name: String!, type: String!, serialNumber: String): Asset
    assignAsset(id: ID!, employeeId: ID!): Asset
  }
`;

const resolvers = {
  Query: {
    assets: () => [
      { id: '1', name: 'MacBook Pro', type: 'Laptop', serialNumber: 'MBP123', assignedTo: '1' },
      { id: '2', name: 'Dell Monitor', type: 'Monitor', serialNumber: 'DL456', assignedTo: null },
    ],
    asset: (_, { id }) => ({ id, name: 'MacBook Pro', type: 'Laptop', serialNumber: 'MBP123', assignedTo: '1' }),
  },
  Mutation: {
    createAsset: (_, { name, type, serialNumber }) => ({ id: '3', name, type, serialNumber, assignedTo: null }),
    assignAsset: (_, { id, employeeId }) => ({ id, name: 'MacBook Pro', type: 'Laptop', serialNumber: 'MBP123', assignedTo: employeeId }),
  },
};

async function startServer() {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4009;
  app.listen(PORT, () => {
    console.log(`Asset Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
