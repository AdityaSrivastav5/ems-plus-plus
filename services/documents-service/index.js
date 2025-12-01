const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const config = require('@ems/config');

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
    documents: (_, { ownerId }) => [
      { id: '1', ownerId, name: 'Contract.pdf', url: '/docs/contract.pdf', type: 'application/pdf' },
    ],
  },
  Mutation: {
    uploadDocument: (_, { ownerId, name, type }) => ({ id: '2', ownerId, name, url: `/docs/${name}`, type }),
  },
};

async function startServer() {
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
