const { gql } = require('graphql');

const typeDefs = gql`
  type Query {
    _empty: String
  }
`;

module.exports = { typeDefs };
