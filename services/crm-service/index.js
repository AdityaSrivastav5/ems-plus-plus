const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { connectDB, mongoose } = require('@ems/shared-lib/db');
const config = require('@ems/config');

// Mongoose Schemas
const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, default: 'NEW' },
  source: String,
  orgId: String,
  createdAt: { type: Date, default: Date.now }
});

const dealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  value: { type: Number, required: true },
  stage: { type: String, required: true },
  closeDate: String,
  orgId: String,
  createdAt: { type: Date, default: Date.now }
});

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  companyId: String,
  orgId: String,
  createdAt: { type: Date, default: Date.now }
});

const Lead = mongoose.model('Lead', leadSchema);
const Deal = mongoose.model('Deal', dealSchema);
const Contact = mongoose.model('Contact', contactSchema);

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
    leads: async () => await Lead.find(),
    deals: async () => await Deal.find(),
    contacts: async () => await Contact.find(),
  },
  Mutation: {
    createLead: async (_, { name, email, source }) => {
      const lead = new Lead({ name, email, source, status: 'NEW' });
      return await lead.save();
    },
    createDeal: async (_, { title, value, stage }) => {
      const deal = new Deal({ title, value, stage });
      return await deal.save();
    },
    createContact: async (_, { name, email, phone }) => {
      const contact = new Contact({ name, email, phone });
      return await contact.save();
    },
    updateDealStage: async (_, { id, stage }) => {
      const deal = await Deal.findById(id);
      if (deal) {
        deal.stage = stage;
        return await deal.save();
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

  const PORT = process.env.PORT || 4007;
  app.listen(PORT, () => {
    console.log(`CRM Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
