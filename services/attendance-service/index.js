const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const config = require('@ems/config');

const typeDefs = gql`
  type Attendance {
    id: ID!
    employeeId: ID!
    date: String!
    checkIn: String
    checkOut: String
    status: String
  }

  type Query {
    attendance(employeeId: ID!, date: String!): Attendance
  }

  type Mutation {
    checkIn(employeeId: ID!): Attendance
    checkOut(employeeId: ID!): Attendance
  }
`;

const resolvers = {
  Query: {
    attendance: () => null,
  },
  Mutation: {
    checkIn: (_, { employeeId }) => ({ id: '1', employeeId, date: new Date().toISOString(), checkIn: new Date().toISOString(), status: 'PRESENT' }),
    checkOut: (_, { employeeId }) => ({ id: '1', employeeId, date: new Date().toISOString(), checkOut: new Date().toISOString(), status: 'PRESENT' }),
  },
};

async function startServer() {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4005;
  app.listen(PORT, () => {
    console.log(`Attendance Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
