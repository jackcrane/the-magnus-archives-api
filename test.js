const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

(async () => {
  console.log(
    await prisma.episode.findFirst({
      where: {
        id: "00e531ff-2734-404a-b301-e8bdb9f128aa",
      },
    })
  );
})();
