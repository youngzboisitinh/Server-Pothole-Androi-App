// server.js
const app = require("./app");
const { connectToDatabase, client } = require("./config/database");

const port = 3000;

async function startServer() {
  try {
    await connectToDatabase();
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

startServer();

process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB connection closed.");
  process.exit(0);
});
