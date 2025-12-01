const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const config = require('@ems/config');

const typeDefs = gql`
  type Organization {
    id: ID!
    name: String!
    slug: String!
    ownerId: ID!
  }

  type Query {
    userOrganizations(userId: ID!): [Organization]
    organization(id: ID!): Organization
  }

  type Mutation {
    createOrganization(name: String!, slug: String!): Organization
  }
`;

const resolvers = {
  Query: {
    userOrganizations: (_, { userId }) => [
      { id: 'org-1', name: 'Acme Corp', slug: 'acme', ownerId: userId },
      { id: 'org-2', name: 'Beta Inc', slug: 'beta', ownerId: userId },
    ],
    organization: (_, { id }) => ({ id, name: 'Acme Corp', slug: 'acme', ownerId: 'mock-user-1' }),
  },
  Mutation: {
    createOrganization: (_, { name, slug }, context) => {
      // In real app, use context.userId as owner
      return {
        id: `org-${Date.now()}`,
        name,
        slug,
        ownerId: context.userId || 'mock-user-1',
      };
    },
  },
};

async function startServer() {
  const app = express();
  const server = new ApolloServer({ 
    typeDefs, 
    resolvers,
    context: ({ req }) => {
      const userId = req.headers['x-user-id'] || 'mock-user-1';
      return { userId };
    }
  });
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4003;
  app.listen(PORT, () => {
    console.log(`Org Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
