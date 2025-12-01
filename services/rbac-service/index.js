const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const config = require('@ems/config');

const typeDefs = gql`
  type Permission {
    id: ID!
    resource: String!
    action: String!
  }

  type Role {
    id: ID!
    name: String!
    permissions: [Permission]
  }

  type Query {
    roles: [Role]
    checkPermission(userId: ID!, resource: String!, action: String!): Boolean
  }

  type Mutation {
    createRole(name: String!, permissions: [PermissionInput]): Role
    assignRole(userId: ID!, roleId: ID!): Boolean
  }

  input PermissionInput {
    resource: String!
    action: String!
  }
`;

const resolvers = {
  Query: {
    roles: () => [
      { id: '1', name: 'Admin', permissions: [{ id: 'p1', resource: '*', action: '*' }] },
      { id: '2', name: 'User', permissions: [{ id: 'p2', resource: 'profile', action: 'read' }] },
    ],
    checkPermission: (_, { userId, resource, action }) => {
      // Mock logic: Admin (user-1) has all permissions
      if (userId === 'mock-user-1') return true;
      return false;
    },
  },
  Mutation: {
    createRole: (_, { name }) => ({ id: '3', name, permissions: [] }),
    assignRole: () => true,
  },
};

async function startServer() {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4002;
  app.listen(PORT, () => {
    console.log(`RBAC Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
