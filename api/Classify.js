export default async function handler(req, res) {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Name query parameter is required",
      });
    }

    const response = await fetch(
      `https://api.genderize.io?name=${name}`
    );

    const result = await response.json();

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
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
}