const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // allow large JSON logs

function getLocalTimestamp() {
    const now = new Date();
    const options = {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    };

    const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(now);

    const lookup = Object.fromEntries(parts.map(p => [p.type, p.value]));

    return `${lookup.year}-${lookup.month}-${lookup.day}_${lookup.hour}-${lookup.minute}-${lookup.second}`;
}

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
let sessionFolder = null;

app.post("/upload", async (req, res) => {
  try {
    const payload = req.body;

    // Create a folder name on first upload
    if (!sessionFolder) {
      sessionFolder = `session_${getLocalTimestamp()}`;
    }

    const timestamp = getLocalTimestamp();
    let filename;

    if (payload.samples && payload.trial && payload.env) {
      // Single trial upload
      filename = `${sessionFolder}/trial-env_${payload.env}-trial_${payload.trial}-${timestamp}.json`;
    } else {
      // Full session upload
      filename = `${sessionFolder}/session-full-${timestamp}.json`;
    }

    const result = await uploadToSupabase(filename, payload);

    res.json({ success: true, file: filename, storage: result });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, error: "Failed to upload" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));