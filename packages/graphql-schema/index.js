const gql = require('graphql-tag');

const typeDefs = gql`
  type Query {
    _empty: String
  }
`;

module.exports = { typeDefs };
