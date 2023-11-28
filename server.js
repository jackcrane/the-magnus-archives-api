const { ApolloServer, gql } = require("apollo-server");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// GraphQL schema definition
const typeDefs = gql`
  type Episode {
    id: ID!
    tags: [Tag!]!
    statementOf: String
    recorder: String
    voiced: [Voice!]!
    title: String!
    episodeNumber: String!
    caseNumber: String
    statementDate: String
    recordingDate: String
    eventDate: String
    summary: String!
    flags: [Flag!]!
    acastUrl: String
    wikiUrl: String
    transcript: String!
  }

  type Tag {
    id: ID!
    text: String!
    episodes: [Episode!]!
  }

  type Voice {
    id: ID!
    name: String!
    episodes: [Episode!]!
  }

  type Flag {
    id: ID!
    text: String!
    episodes: [Episode!]!
  }

  type Update {
    id: ID!
    changelog: String!
    createdAt: String!
  }

  type Query {
    episodes: [Episode!]!
    episode(id: ID!): Episode

    tags: [Tag!]!
    tag(id: ID!): Tag

    voices: [Voice!]!
    voice(id: ID!): Voice

    flags: [Flag!]!
    flag(id: ID!): Flag

    updates: [Update!]!
    update(id: ID!): Update
  }
`;

// Resolvers define how to fetch the types defined in the schema
const resolvers = {
  Query: {
    episodes: async () => {
      const d = await prisma.episode.findMany({
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          voiced: {
            include: {
              voice: true,
            },
          },
          flags: {
            include: {
              flag: true,
            },
          },
        },
      });
      d.forEach((e) => {
        e.tags = e.tags.map((t) => t.tag);
        e.voiced = e.voiced.map((v) => v.voice);
        e.flags = e.flags.map((f) => f.flag);
      });
      return d;
    },
    episode: async (_, args) => {
      let d = await prisma.episode.findFirst({
        where: { id: args.id.toString() },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          voiced: {
            include: {
              voice: true,
            },
          },
          flags: {
            include: {
              flag: true,
            },
          },
        },
      });
      d.tags = d.tags.map((t) => t.tag);
      d.voiced = d.voiced.map((v) => v.voice);
      d.flags = d.flags.map((f) => f.flag);

      console.log(d);
      return d;
    },
    tags: async () => {
      const d = await prisma.tag.findMany({
        include: {
          episodes: {
            include: {
              episode: true,
            },
          },
        },
      });
      d.forEach((t) => {
        t.episodes = t.episodes.map((e) => e.episode);
      });
      return d;
    },
    tag: async (_, args) => {
      let d = await prisma.tag.findFirst({
        where: { id: args.id.toString() },
        include: {
          episodes: {
            include: {
              episode: true,
            },
          },
        },
      });
      d.episodes = d.episodes.map((e) => e.episode);
      return d;
    },
    voices: async () => {
      const d = await prisma.voice.findMany({
        include: {
          episodes: {
            include: {
              episode: true,
            },
          },
        },
      });
      d.forEach((v) => {
        v.episodes = v.episodes.map((e) => e.episode);
      });
      return d;
    },
    voice: async (_, args) => {
      let d = await prisma.voice.findFirst({
        where: { id: args.id.toString() },
        include: {
          episodes: {
            include: {
              episode: true,
            },
          },
        },
      });
      d.episodes = d.episodes.map((e) => e.episode);
      return d;
    },
    flags: async () => {
      const d = await prisma.flag.findMany({
        include: {
          episodes: {
            include: {
              episode: true,
            },
          },
        },
      });
      d.forEach((f) => {
        f.episodes = f.episodes.map((e) => e.episode);
      });
      return d;
    },
    flag: async (_, args) => {
      let d = await prisma.flag.findFirst({
        where: { id: args.id.toString() },
        include: {
          episodes: {
            include: {
              episode: true,
            },
          },
        },
      });
      d.episodes = d.episodes.map((e) => e.episode);
      return d;
    },
    updates: async () => {
      return await prisma.updates.findMany();
    },
    update: async (_, args) => {
      return await prisma.updates.findFirst({
        where: { id: args.id.toString() },
      });
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
