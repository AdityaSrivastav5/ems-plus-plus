const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { connectDB, mongoose } = require('@ems/shared-lib/db');
const config = require('@ems/config');

// Mongoose Schemas
const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  permissions: [{ resource: String, action: String }],
  orgId: String,
  createdAt: { type: Date, default: Date.now }
});

const Role = mongoose.model('Role', roleSchema);

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
    roles: async () => await Role.find(),
    checkPermission: async (_, { userId, resource, action }) => {
      // Mock logic: Admin (user-1) has all permissions
      if (userId === 'mock-user-1') return true;
      return false;
    },
  },
  Mutation: {
    createRole: async (_, { name, permissions }) => {
      const role = new Role({ name, permissions });
      return await role.save();
    },
    assignRole: async () => true,
  },
};

async function startServer() {
  await connectDB();
  
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
