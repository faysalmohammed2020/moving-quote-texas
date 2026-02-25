import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
  const data = await prisma.blogPost.findMany({
    orderBy: { id: "desc" } // চাইলে remove করতে পারো
  });

  fs.writeFileSync("BlogPost.json", JSON.stringify(data, null, 2), "utf-8");
  console.log(`✅ Exported ${data.length} rows to BlogPost.json`);
}

main()
  .catch((e) => {
    console.error("❌ Export failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
