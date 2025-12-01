const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { connectDB, mongoose } = require('@ems/shared-lib/db');
const config = require('@ems/config');

// Mongoose Schema
const attendanceSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  checkIn: Date,
  checkOut: Date,
  status: { type: String, default: 'present' }, // present, absent, leave
  orgId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Compound index to ensure one record per user per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

const typeDefs = gql`
  scalar Date

  type Attendance {
    id: ID!
    userId: String!
    date: String!
    checkIn: String
    checkOut: String
    status: String!
    createdAt: String
  }

  type Query {
    myAttendance(startDate: String, endDate: String): [Attendance!]!
    todayAttendance: Attendance
  }

  type Mutation {
    clockIn: Attendance!
    clockOut: Attendance!
  }
`;

const resolvers = {
  Query: {
    myAttendance: async (_, { startDate, endDate }, context) => {
      if (!context.userId) throw new Error('Unauthorized');
      
      const query = { 
        userId: context.userId,
        orgId: context.orgId 
      };
      
      if (startDate && endDate) {
        query.date = { 
          $gte: new Date(startDate), 
          $lte: new Date(endDate) 
        };
      }
      
      return await Attendance.find(query).sort({ date: -1 });
    },
    
    todayAttendance: async (_, __, context) => {
      if (!context.userId) throw new Error('Unauthorized');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return await Attendance.findOne({ 
        userId: context.userId,
        date: today 
      });
    }
  },
  
  Mutation: {
    clockIn: async (_, __, context) => {
      if (!context.userId) throw new Error('Unauthorized');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if already clocked in
      const existing = await Attendance.findOne({
        userId: context.userId,
        date: today
      });
      
      if (existing) {
        throw new Error('Already clocked in for today');
      }
      
      const attendance = new Attendance({
        userId: context.userId,
        date: today,
        checkIn: new Date(),
        status: 'present',
        orgId: context.orgId
      });
      
      return await attendance.save();
    },
    
    clockOut: async (_, __, context) => {
      if (!context.userId) throw new Error('Unauthorized');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const attendance = await Attendance.findOne({
        userId: context.userId,
        date: today
      });
      
      if (!attendance) {
        throw new Error('No attendance record found for today');
      }
      
      if (attendance.checkOut) {
        throw new Error('Already clocked out');
      }
      
      attendance.checkOut = new Date();
      return await attendance.save();
    }
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

  const PORT = process.env.PORT || 4005;
  app.listen(PORT, () => {
    console.log(`Attendance Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
