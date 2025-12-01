const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const config = require('@ems/config');

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
    leaveRequests: () => [],
  },
  Mutation: {
    applyLeave: (_, { employeeId, type, startDate, endDate }) => ({ id: '1', employeeId, type, startDate, endDate, status: 'PENDING' }),
    approveLeave: (_, { id }) => ({ id, employeeId: '1', type: 'SICK', startDate: '2023-01-01', endDate: '2023-01-02', status: 'APPROVED' }),
  },
};

async function startServer() {
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
