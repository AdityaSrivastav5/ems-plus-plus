const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs } = require('@ems/graphql-schema'); // Placeholder
const config = require('@ems/config');

async function startServer() {
  const app = express();
  
  // Placeholder resolver
  const resolvers = {
    Query: {
      _empty: () => 'EMS Gateway',
    },
  };

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // In a real app, verify JWT here.
      // For now, we simulate extraction.
      const token = req.headers.authorization || '';
      const orgId = req.headers['x-org-id'] || '';
      
      // Mock user extraction from token
      const userId = token ? 'mock-user-1' : null;

      return { userId, orgId, headers: req.headers };
    },
  });
  await server.start();
  server.applyMiddleware({ app });

  app.listen(config.PORT || 4000, () => {
    console.log(`Gateway ready at http://localhost:${config.PORT || 4000}${server.graphqlPath}`);
  });
}

startServer();
