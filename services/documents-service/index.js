const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { connectDB, mongoose } = require('@ems/shared-lib/db');
const config = require('@ems/config');

// Mongoose Schema
const documentSchema = new mongoose.Schema({
  ownerId: { type: String, required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true },
  orgId: String,
  createdAt: { type: Date, default: Date.now }
});

const Document = mongoose.model('Document', documentSchema);

const typeDefs = gql`
  type Document {
    id: ID!
    ownerId: ID!
    name: String!
    url: String!
    type: String!
  }

  type Query {
    documents(ownerId: ID!): [Document]
  }

  type Mutation {
    uploadDocument(ownerId: ID!, name: String!, type: String!): Document
  }
`;

const resolvers = {
  Query: {
    documents: async (_, { ownerId }) => await Document.find({ ownerId }),
  },
  Mutation: {
    uploadDocument: async (_, { ownerId, name, type }) => {
      const doc = new Document({
        ownerId,
        name,
        type,
        url: `https://storage.example.com/${name}` // Mock URL
      });
      return await doc.save();
    },
  },
};

async function startServer() {
  await connectDB();
  
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4011;
  app.listen(PORT, () => {
    console.log(`Documents Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
