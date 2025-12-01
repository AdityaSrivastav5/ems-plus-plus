const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const config = require('@ems/config');

const typeDefs = gql`
  type Query {
    auth: String
  }
`;

const resolvers = {
  Query: {
    auth: () => 'Auth Service',
  },
};

async function startServer() {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4001;
  app.listen(PORT, () => {
    console.log(`Auth Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
