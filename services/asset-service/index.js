const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { connectDB, mongoose } = require('@ems/shared-lib/db');
const config = require('@ems/config');

// Mongoose Schema
const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  serialNumber: String,
  assignedTo: String,
  orgId: String,
  createdAt: { type: Date, default: Date.now }
});

const Asset = mongoose.model('Asset', assetSchema);

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
    assets: async () => await Asset.find(),
    asset: async (_, { id }) => await Asset.findById(id),
  },
  Mutation: {
    createAsset: async (_, { name, type, serialNumber }) => {
      const asset = new Asset({ name, type, serialNumber });
      return await asset.save();
    },
    assignAsset: async (_, { id, employeeId }) => {
      const asset = await Asset.findById(id);
      if (asset) {
        asset.assignedTo = employeeId;
        return await asset.save();
      }
      return null;
    },
  },
};

async function startServer() {
  await connectDB();
  
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
