const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { connectDB, mongoose } = require('@ems/shared-lib/db');
const config = require('@ems/config');

// Mongoose Schema
const leaveRequestSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  type: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  status: { type: String, default: 'PENDING' },
  orgId: String,
  createdAt: { type: Date, default: Date.now }
});

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);

const typeDefs = gql`
  type LeaveRequest {
    id: ID!
    employeeId: ID!
    type: String!
    startDate: String!
    endDate: String!
    status: String!
  }

  type Query {
    leaveRequests(employeeId: ID!): [LeaveRequest]
  }

  type Mutation {
    applyLeave(employeeId: ID!, type: String!, startDate: String!, endDate: String!): LeaveRequest
    approveLeave(id: ID!): LeaveRequest
  }
`;

const resolvers = {
  Query: {
    leaveRequests: async (_, { employeeId }) => {
      return await LeaveRequest.find({ employeeId });
    },
  },
  Mutation: {
    applyLeave: async (_, { employeeId, type, startDate, endDate }) => {
      const leave = new LeaveRequest({ employeeId, type, startDate, endDate, status: 'PENDING' });
      return await leave.save();
    },
    approveLeave: async (_, { id }) => {
      const leave = await LeaveRequest.findById(id);
      if (leave) {
        leave.status = 'APPROVED';
        return await leave.save();
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

  const PORT = process.env.PORT || 4006;
  app.listen(PORT, () => {
    console.log(`Leave Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
