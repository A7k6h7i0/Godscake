import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { connectDb } from "../src/config/db.js";
import { ingestBakeryFile } from "../src/ingestion/bakeryIngestion.js";
import Bakery from "../src/models/Bakery.js";
import Cake from "../src/models/Cake.js";
import { cakeCatalog } from "../src/config/cakeCatalog.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
  await connectDb();

  const csvPath = path.resolve(__dirname, "../src/ingestion/sample-bakeries.csv");
  const bakeries = await ingestBakeryFile(csvPath);

  if (!bakeries.length) {
    // eslint-disable-next-line no-console
    console.log("No bakeries to seed.");
    process.exit(0);
  }

  await Bakery.deleteMany({});
  await Cake.deleteMany({});

  const createdBakeries = await Bakery.insertMany(bakeries);

  const cakePayload = [];
  for (const bakery of createdBakeries) {
    for (const template of cakeCatalog) {
      cakePayload.push({
        bakeryId: bakery._id,
        ...template,
      });
    }
  }
  await Cake.insertMany(cakePayload);

  // eslint-disable-next-line no-console
  console.log(`Seeded ${createdBakeries.length} bakeries and ${cakePayload.length} cakes`);
  await mongoose.connection.close();
};

run().catch(async (error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
