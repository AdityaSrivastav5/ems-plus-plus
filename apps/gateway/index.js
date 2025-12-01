const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { stitchSchemas } = require('@graphql-tools/stitch');
const { loadSchema } = require('@graphql-tools/load');
const { UrlLoader } = require('@graphql-tools/url-loader');
const { verifyToken, extractToken } = require('@ems/shared-lib/auth');
const config = require('@ems/config');

async function makeGatewaySchema() {
  // Define remote services
  const services = [
    { name: 'auth', url: 'http://localhost:4001/graphql' },
    { name: 'employee', url: 'http://localhost:4004/graphql' },
    { name: 'crm', url: 'http://localhost:4007/graphql' },
    { name: 'task', url: 'http://localhost:4008/graphql' },
    { name: 'attendance', url: 'http://localhost:4005/graphql' },
  ];

  // Load remote schemas
  const subschemas = await Promise.all(services.map(async (service) => {
    const schema = await loadSchema(service.url, {
      loaders: [new UrlLoader()],
      headers: (context) => {
        return {
          'Authorization': context?.headers?.authorization || '',
          'x-org-id': context?.headers?.['x-org-id'] || '',
          'x-user-id': context?.userId || '',
        };
      }
    });
    return { schema };
  }));

  // Stitch them together
  return stitchSchemas({
    subschemas,
  });
}

async function startServer() {
  const app = express();
  
  try {
    // Wait for services to be ready
    console.log('Waiting for services to start...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const schema = await makeGatewaySchema();
    
    const server = new ApolloServer({ 
      schema,
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
  } catch (error) {
    console.error('Failed to start gateway:', error);
  }
}

startServer();
