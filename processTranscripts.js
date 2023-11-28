const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const matter = require("gray-matter");

const prisma = new PrismaClient();
const transcriptsDir = path.join(__dirname, "transcripts");

const _s = (value) => (value ? `"${value}"` : null);

async function processTranscriptFile(filePath, i) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const parsed = matter(content);

    // Checking if episode already exists
    const existing = await prisma.episode.findFirst({
      where: { episodeNumber: parsed.data.episode_number },
    });

    if (existing) {
      // console.log(`Skipping ${filePath} because it already exists`);
      return;
    } else {
      console.log(`Processing ${filePath} [${i}]`);
    }

    // Protect from not iterable error
    if (!Array.isArray(parsed.data.voiced)) {
      parsed.data.voiced = [];
    }
    if (!Array.isArray(parsed.data.tags)) {
      parsed.data.tags = [];
    }
    if (!Array.isArray(parsed.data.content_flags)) {
      parsed.data.content_flags = [];
    }

    // Remove duplicates
    parsed.data.voiced = [...new Set(parsed.data.voiced)];
    parsed.data.tags = [...new Set(parsed.data.tags)];
    parsed.data.content_flags = [...new Set(parsed.data.content_flags)];

    // Creating new voices
    const voiceIdMap = new Map();
    for (const voice of parsed.data.voiced) {
      const existing = await prisma.voice.findFirst({
        where: { name: voice },
      });

      if (existing) {
        voiceIdMap.set(voice, existing.id);
      } else {
        const newVoice = await prisma.voice.create({
          data: { name: voice },
        });
        voiceIdMap.set(voice, newVoice.id);
      }
    }

    // Creating new tags
    const tagIdMap = new Map();
    for (const tag of parsed.data.tags) {
      const existing = await prisma.tag.findFirst({
        where: { text: tag },
      });

      if (existing) {
        tagIdMap.set(tag, existing.id);
      } else {
        const newTag = await prisma.tag.create({
          data: { text: tag },
        });
        tagIdMap.set(tag, newTag.id);
      }
    }

    // Creating new flags
    const flagIdMap = new Map();
    for (const flag of parsed.data.content_flags) {
      const existing = await prisma.flag.findFirst({
        where: { text: flag },
      });

      if (existing) {
        flagIdMap.set(flag, existing.id);
      } else {
        const newFlag = await prisma.flag.create({
          data: { text: flag },
        });
        flagIdMap.set(flag, newFlag.id);
      }
    }

    let statementDate = new Date(parsed.data.statement_date);
    if (isNaN(statementDate)) {
      statementDate = null;
    }
    let recordingDate = new Date(parsed.data.recording_date);
    if (isNaN(recordingDate)) {
      recordingDate = null;
    }

    // Creating new episode
    await prisma.episode.create({
      data: {
        title: parsed.data.episode_title,
        episodeNumber: parsed.data.episode_number,
        caseNumber: parsed.data.case_number,
        statementDate,
        recordingDate,
        eventDate: _s(parsed.data.event_date),
        summary: parsed.data.summary,
        acastUrl: parsed.data.acast_url,
        wikiUrl: parsed.data.wiki_url,
        transcript: parsed.content,
        statementOf: parsed.data.statement_of?.join(", ") || null,
        recorder: parsed.data.recorder?.join(", ") || null,
        voiced: {
          create: parsed.data.voiced.map((voice) => ({
            voice: { connect: { id: voiceIdMap.get(voice) } },
          })),
        },
        tags: {
          create: parsed.data.tags.map((tag) => ({
            tag: { connect: { id: tagIdMap.get(tag) } },
          })),
        },
        flags: {
          create: parsed.data.content_flags.map((flag) => ({
            flag: { connect: { id: flagIdMap.get(flag) } },
          })),
        },
      },
    });

    console.log(`Processed and saved: ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}: `, error);
  }
}

async function processAllTranscripts() {
  const files = fs.readdirSync(transcriptsDir);
  let iterations = 0;
  for (const file of files) {
    if (file.endsWith(".md")) {
      await processTranscriptFile(path.join(transcriptsDir, file), iterations);
    }
    iterations++;
  }
}

processAllTranscripts()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/*
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Episode {
  id String @id @default(uuid())

  tags EpisodeTag[]
  statementOf String
  recorder String
  voiced EpisodeVoice[]
  title String
  episodeNumber String
  caseNumber String
  statementDate DateTime
  recordingDate DateTime?
  eventDate String
  summary String
  flags EpisodeFlags[]
  acastUrl String
  wikiUrl String
  transcript String @db.MediumText

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model EpisodeFlags {
  @@id([episodeId, flagId])
  episodeId String
  episode Episode @relation(fields: [episodeId], references: [id])
  flagId String
  flag Flag @relation(fields: [flagId], references: [id])
}

model Voice {
  id String @id @default(uuid())
  name String @unique
  episodes EpisodeVoice[]
}

model EpisodeVoice {
  @@id([episodeId, voiceId])
  episodeId String
  episode Episode @relation(fields: [episodeId], references: [id])
  voiceId String
  voice Voice @relation(fields: [voiceId], references: [id])
}

model Flag {
  id String @id @default(uuid())
  text String @unique
  episodes EpisodeFlags[]
}

model EpisodeTag {
  @@id([episodeId, tagId])
  episodeId String
  episode Episode @relation(fields: [episodeId], references: [id])
  tagId String
  tag Tag @relation(fields: [tagId], references: [id])
}

model Tag {
  id String @id @default(uuid())
  text String @unique
  episodes EpisodeTag[]
}

model Updates {
  id String @id @default(uuid())
  changelog String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
*/
