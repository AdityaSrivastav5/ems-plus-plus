const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { connectDB, mongoose } = require('@ems/shared-lib/db');
const config = require('@ems/config');

// Mongoose Schemas
const payrollRunSchema = new mongoose.Schema({
  month: { type: String, required: true },
  year: { type: Number, required: true },
  status: { type: String, default: 'PENDING' },
  totalAmount: Number,
  orgId: String,
  createdAt: { type: Date, default: Date.now }
});

const payslipSchema = new mongoose.Schema({
  runId: { type: String, required: true },
  employeeId: { type: String, required: true },
  netSalary: { type: Number, required: true },
  pdfUrl: String,
  orgId: String,
  createdAt: { type: Date, default: Date.now }
});

const PayrollRun = mongoose.model('PayrollRun', payrollRunSchema);
const Payslip = mongoose.model('Payslip', payslipSchema);

const typeDefs = gql`
  type PayrollRun {
    id: ID!
    month: String!
    year: Int!
    status: String!
    totalAmount: Float
  }

  type Payslip {
    id: ID!
    runId: ID!
    employeeId: ID!
    netSalary: Float!
    pdfUrl: String
  }

  type Query {
    payrollRuns: [PayrollRun]
    payrollRun(id: ID!): PayrollRun
    payslips(runId: ID!): [Payslip]
  }

  type Mutation {
    createPayrollRun(month: String!, year: Int!): PayrollRun
    finalizePayrollRun(id: ID!): PayrollRun
  }
`;

const resolvers = {
  Query: {
    payrollRuns: async () => await PayrollRun.find(),
    payrollRun: async (_, { id }) => await PayrollRun.findById(id),
    payslips: async (_, { runId }) => await Payslip.find({ runId }),
  },
  Mutation: {
    createPayrollRun: async (_, { month, year }) => {
      const run = new PayrollRun({ month, year, status: 'PENDING' });
      return await run.save();
    },
    finalizePayrollRun: async (_, { id }) => {
      const run = await PayrollRun.findById(id);
      if (run) {
        run.status = 'COMPLETED';
        run.totalAmount = 100000; // Mock calculation
        return await run.save();
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

  const PORT = process.env.PORT || 4008;
  app.listen(PORT, () => {
    console.log(`Payroll Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
