const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { connectDB, mongoose } = require('@ems/shared-lib/db');
const config = require('@ems/config');

// Mongoose Schema
const attendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  date: { type: String, required: true },
  checkIn: String,
  checkOut: String,
  status: { type: String, default: 'PRESENT' },
  orgId: String,
  createdAt: { type: Date, default: Date.now }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

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
    attendance: async (_, { employeeId, date }) => {
      return await Attendance.findOne({ employeeId, date });
    },
  },
  Mutation: {
    checkIn: async (_, { employeeId }) => {
      const today = new Date().toISOString().split('T')[0];
      const attendance = new Attendance({
        employeeId,
        date: today,
        checkIn: new Date().toISOString(),
        status: 'PRESENT'
      });
      return await attendance.save();
    },
    checkOut: async (_, { employeeId }) => {
      const today = new Date().toISOString().split('T')[0];
      const attendance = await Attendance.findOne({ employeeId, date: today });
      if (attendance) {
        attendance.checkOut = new Date().toISOString();
        return await attendance.save();
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

  const PORT = process.env.PORT || 4005;
  app.listen(PORT, () => {
    console.log(`Attendance Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
