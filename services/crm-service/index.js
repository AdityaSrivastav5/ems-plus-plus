const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const config = require('@ems/config');

const typeDefs = gql`
  type Lead {
    id: ID!
    name: String!
    email: String!
    status: String!
    source: String
  }

  type Deal {
    id: ID!
    title: String!
    value: Float!
    stage: String!
    closeDate: String
  }

  type Contact {
    id: ID!
    name: String!
    email: String!
    phone: String
    companyId: ID
  }

  type Query {
    leads: [Lead]
    deals: [Deal]
    contacts: [Contact]
  }

  type Mutation {
    createLead(name: String!, email: String!, source: String): Lead
    createDeal(title: String!, value: Float!, stage: String!): Deal
    createContact(name: String!, email: String!, phone: String): Contact
    updateDealStage(id: ID!, stage: String!): Deal
  }
`;

const resolvers = {
  Query: {
    leads: () => [
      { id: '1', name: 'Acme Corp', email: 'contact@acme.com', status: 'NEW', source: 'Website' },
      { id: '2', name: 'Globex', email: 'info@globex.com', status: 'CONTACTED', source: 'Referral' },
    ],
    deals: () => [
      { id: '1', title: 'Acme Contract', value: 50000, stage: 'PROPOSAL', closeDate: '2023-12-31' },
      { id: '2', title: 'Globex Renewal', value: 12000, stage: 'NEGOTIATION', closeDate: '2023-11-15' },
    ],
    contacts: () => [
      { id: '1', name: 'Alice Smith', email: 'alice@acme.com', phone: '555-0101' },
      { id: '2', name: 'Bob Jones', email: 'bob@globex.com', phone: '555-0102' },
    ],
  },
  Mutation: {
    createLead: (_, { name, email, source }) => ({ id: '3', name, email, status: 'NEW', source }),
    createDeal: (_, { title, value, stage }) => ({ id: '3', title, value, stage, closeDate: null }),
    createContact: (_, { name, email, phone }) => ({ id: '3', name, email, phone }),
    updateDealStage: (_, { id, stage }) => ({ id, title: 'Updated Deal', value: 0, stage, closeDate: null }),
  },
};

async function startServer() {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4007;
  app.listen(PORT, () => {
    console.log(`CRM Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
