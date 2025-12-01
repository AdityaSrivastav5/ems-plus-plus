const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { connectDB, mongoose } = require('@ems/shared-lib/db');
const config = require('@ems/config');

// Mongoose Schema
const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  ownerId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Organization = mongoose.model('Organization', organizationSchema);

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
    userOrganizations: async (_, { userId }) => await Organization.find({ ownerId: userId }),
    organization: async (_, { id }) => await Organization.findById(id),
  },
  Mutation: {
    createOrganization: async (_, { name, slug }, context) => {
      const org = new Organization({
        name,
        slug,
        ownerId: context.userId || 'mock-user-1'
      });
      return await org.save();
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
