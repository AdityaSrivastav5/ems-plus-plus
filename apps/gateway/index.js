const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { verifyToken, extractToken } = require('@ems/shared-lib/auth');
const config = require('@ems/config');

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello from Gateway!',
  },
};

async function startServer() {
  const app = express();
  
  const server = new ApolloServer({ 
    typeDefs, 
    resolvers,
    context: ({ req }) => {
      // Extract token from Authorization header
      const token = extractToken(req.headers.authorization);
      
      // Verify token and extract user info
      let userId = null;
      let userEmail = null;
      
      if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
          userId = decoded.userId;
          userEmail = decoded.email;
        }
      }
      
      // Get orgId from header
      const orgId = req.headers['x-org-id'];
      
      return {
        userId,
        userEmail,
        orgId,
        headers: req.headers
      };
    }
  });
  
  await server.start();
  server.applyMiddleware({ app });

  const PORT = config.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Gateway ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
