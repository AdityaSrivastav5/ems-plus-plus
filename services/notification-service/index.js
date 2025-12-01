const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { connectDB, mongoose } = require('@ems/shared-lib/db');
const config = require('@ems/config');

// Mongoose Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  orgId: String,
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

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
    notifications: async (_, { userId }) => await Notification.find({ userId }),
  },
  Mutation: {
    markAsRead: async (_, { id }) => {
      const notification = await Notification.findById(id);
      if (notification) {
        notification.read = true;
        return await notification.save();
      }
      return null;
    },
    sendNotification: async (_, { userId, message }) => {
      const notification = new Notification({ userId, message });
      return await notification.save();
    },
  },
};

async function startServer() {
  await connectDB();
  
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
