import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

// CORS (Required for grading)
app.use(cors({ origin: "*" }));

app.get("/api/classify", async (req, res) => {
  try {
    const { name } = req.query;

    // 400 - Missing name
    if (name === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Name query parameter is required",
      });
    }

    // 422 - Non-string name (happens when name is repeated)
    if (typeof name !== "string") {
      return res.status(422).json({
        status: "error",
        message: "Name must be a string",
      });
    }

    // 400 - Empty name
    if (name.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Name query parameter is required",
      });
    }

    // Call Genderize API
    const response = await fetch(
      `https://api.genderize.io?name=${encodeURIComponent(name)}`
    );

    // External API failure
    if (!response.ok) {
      return res.status(502).json({
        status: "error",
        message: "Failed to reach Genderize API",
      });
    }

    const result = await response.json();

    // Edge case: no prediction
    if (result.gender === null || result.count === 0) {
      return res.status(400).json({
        status: "error",
        message: "No prediction available for the provided name",
      });
    }

    // Process data
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
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});