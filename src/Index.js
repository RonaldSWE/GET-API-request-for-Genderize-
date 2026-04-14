// src/index.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Middle wares
const app = express();
app.use(cors());
const port= process.env.PORT || 3000;

dotenv.config();

app.get("/api/classify", async (req, res) => {
  const name = req.query.name;

  if (typeof name !== "string") {
    return res.status(422).json({
      status: "error",
      message: "Name must be a string",
    });
  }

  if (name.trim() === "") {
    return res.status(400).json({
      status: "error",
      message: "Name query parameter is required",
    });
  }

  const response = await fetch(`https://api.genderize.io?name=${name}`);
  const result = await response.json();

  if (response.status >= 500) {
    return res.status(502).json({
      status: "error",
      message: "Failed to fetch data from the Genderize API",
    });
  }

  if (result.gender === null || result.count === 0) {
    return res.status(400).json({
      status: "error",
      message: "No prediction available for the provided name",
    });
  }

  return res.json({
    status: "success",
    data: {
      name: result.name,
      gender: result.gender,
      probability: result.probability,
      sample_size: result.count,
      is_confident: result.probability >= 0.7 && result.count >= 100,
      processed_at: new Date().toISOString(),
    },
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
