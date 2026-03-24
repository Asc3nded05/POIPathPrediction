const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // allow large JSON logs

// Upload JSON files to Supabase for permanent storage
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function uploadToSupabase(filename, data) {
  const jsonString = JSON.stringify(data, null, 2);

  const { data: uploadData, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET)
    .upload(filename, Buffer.from(jsonString), {
      contentType: "application/json",
      upsert: false
    });

  if (error) {
    console.error("Supabase upload error:", error);
    throw error;
  }

  return uploadData;
}

// Ensure data folder exists
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// Upload endpoint
app.post("/upload", async (req, res) => {
  try {
    const sessionData = req.body;

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `session-${timestamp}.json`;

    // Upload directly to Supabase
    const result = await uploadToSupabase(filename, sessionData);

    res.json({
      success: true,
      file: filename,
      storage: result
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, error: "Failed to upload to Supabase" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));