const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const config = require('@ems/config');

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
    payrollRuns: () => [
      { id: '1', month: 'November', year: 2023, status: 'COMPLETED', totalAmount: 150000 },
      { id: '2', month: 'December', year: 2023, status: 'DRAFT', totalAmount: 0 },
    ],
    payrollRun: (_, { id }) => ({ id, month: 'December', year: 2023, status: 'DRAFT', totalAmount: 0 }),
    payslips: (_, { runId }) => [
      { id: '101', runId, employeeId: '1', netSalary: 5000, pdfUrl: '/payslips/101.pdf' },
      { id: '102', runId, employeeId: '2', netSalary: 6000, pdfUrl: '/payslips/102.pdf' },
    ],
  },
  Mutation: {
    createPayrollRun: (_, { month, year }) => ({ id: '3', month, year, status: 'DRAFT', totalAmount: 0 }),
    finalizePayrollRun: (_, { id }) => ({ id, month: 'December', year: 2023, status: 'COMPLETED', totalAmount: 160000 }),
  },
};

async function startServer() {
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
