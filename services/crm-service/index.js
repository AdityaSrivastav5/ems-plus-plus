const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { connectDB, mongoose } = require('@ems/shared-lib/db');
const config = require('@ems/config');

// Mongoose Schemas
const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  company: String,
  status: { type: String, default: 'new' }, // new, contacted, qualified, lost
  source: String,
  value: Number,
  orgId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const dealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  value: { type: Number, required: true },
  stage: { type: String, required: true }, // prospecting, qualification, proposal, negotiation, closed-won, closed-lost
  closeDate: Date,
  contactName: String,
  company: String,
  orgId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  company: String,
  position: String,
  orgId: { type: String, required: true },
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
    phone: String
    company: String
    status: String!
    source: String
    value: Float
    createdAt: String
  }

  type Deal {
    id: ID!
    title: String!
    value: Float!
    stage: String!
    closeDate: String
    contactName: String
    company: String
    createdAt: String
  }

  type Contact {
    id: ID!
    name: String!
    email: String!
    phone: String
    company: String
    position: String
    createdAt: String
  }

  input LeadInput {
    name: String!
    email: String!
    phone: String
    company: String
    source: String
    value: Float
  }

  input DealInput {
    title: String!
    value: Float!
    stage: String!
    closeDate: String
    contactName: String
    company: String
  }

  input ContactInput {
    name: String!
    email: String!
    phone: String
    company: String
    position: String
  }

  type Query {
    leads(status: String): [Lead!]!
    lead(id: ID!): Lead
    deals(stage: String): [Deal!]!
    deal(id: ID!): Deal
    contacts: [Contact!]!
    contact(id: ID!): Contact
  }

  type Mutation {
    createLead(input: LeadInput!): Lead!
    updateLeadStatus(id: ID!, status: String!): Lead!
    deleteLead(id: ID!): Boolean!
    
    createDeal(input: DealInput!): Deal!
    updateDealStage(id: ID!, stage: String!): Deal!
    deleteDeal(id: ID!): Boolean!
    
    createContact(input: ContactInput!): Contact!
    deleteContact(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    leads: async (_, { status }, context) => {
      const query = { orgId: context.orgId };
      if (status) query.status = status;
      return await Lead.find(query).sort({ createdAt: -1 });
    },
    lead: async (_, { id }) => await Lead.findById(id),
    
    deals: async (_, { stage }, context) => {
      const query = { orgId: context.orgId };
      if (stage) query.stage = stage;
      return await Deal.find(query).sort({ createdAt: -1 });
    },
    deal: async (_, { id }) => await Deal.findById(id),
    
    contacts: async (_, __, context) => {
      return await Contact.find({ orgId: context.orgId }).sort({ createdAt: -1 });
    },
    contact: async (_, { id }) => await Contact.findById(id),
  },
  
  Mutation: {
    createLead: async (_, { input }, context) => {
      const lead = new Lead({ ...input, orgId: context.orgId, status: 'new' });
      return await lead.save();
    },
    updateLeadStatus: async (_, { id, status }) => {
      return await Lead.findByIdAndUpdate(id, { status }, { new: true });
    },
    deleteLead: async (_, { id }) => {
      await Lead.findByIdAndDelete(id);
      return true;
    },
    
    createDeal: async (_, { input }, context) => {
      const deal = new Deal({ ...input, orgId: context.orgId });
      return await deal.save();
    },
    updateDealStage: async (_, { id, stage }) => {
      return await Deal.findByIdAndUpdate(id, { stage }, { new: true });
    },
    deleteDeal: async (_, { id }) => {
      await Deal.findByIdAndDelete(id);
      return true;
    },
    
    createContact: async (_, { input }, context) => {
      const contact = new Contact({ ...input, orgId: context.orgId });
      return await contact.save();
    },
    deleteContact: async (_, { id }) => {
      await Contact.findByIdAndDelete(id);
      return true;
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
      const userId = req.headers['x-user-id'];
      const orgId = req.headers['x-org-id'] || 'org-1';
      return { userId, orgId };
    }
  });
  
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4007;
  app.listen(PORT, () => {
    console.log(`CRM Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
