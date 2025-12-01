const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { connectDB, mongoose } = require('@ems/shared-lib/db');
const { hashPassword, comparePassword, generateToken } = require('@ems/shared-lib/auth');
const config = require('@ems/config');

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  orgId: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    orgId: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }
`;

const resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }
      return await User.findById(context.userId).select('-password');
    },
  },
  Mutation: {
    register: async (_, { name, email, password }) => {
      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role: 'user'
      });

      await user.save();

      // Generate token
      const token = generateToken({ userId: user._id, email: user.email });

      return {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          orgId: user.orgId
        }
      };
    },

    login: async (_, { email, password }) => {
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = generateToken({ userId: user._id, email: user.email });

      return {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          orgId: user.orgId
        }
      };
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
      return { userId };
    }
  });
  
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4001;
  app.listen(PORT, () => {
    console.log(`Auth Service ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
