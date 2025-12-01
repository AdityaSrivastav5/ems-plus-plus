const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const config = require('@ems/config');

const typeDefs = gql`
  type Notification {
    id: ID!
    userId: ID!
    message: String!
    read: Boolean!
    createdAt: String
  }

  type Query {
    notifications(userId: ID!): [Notification]
  }

  type Mutation {
    markAsRead(id: ID!): Notification
    sendNotification(userId: ID!, message: String!): Notification
  }
`;

const resolvers = {
  Query: {
    notifications: (_, { userId }) => [
      { id: '1', userId, message: 'Welcome to EMS++', read: false, createdAt: new Date().toISOString() },
    ],
  },
  Mutation: {
    markAsRead: (_, { id }) => ({ id, userId: '1', message: 'Welcome to EMS++', read: true, createdAt: new Date().toISOString() }),
    sendNotification: (_, { userId, message }) => ({ id: '2', userId, message, read: false, createdAt: new Date().toISOString() }),
  },
};

async function startServer() {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4010;
  app.listen(PORT, () => {
    console.log(`Notification Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
