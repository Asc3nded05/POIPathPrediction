const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // allow large JSON logs

// Upload JSON files to Google Drive for permanent storage
const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GDRIVE_CLIENT_EMAIL,
    private_key: process.env.GDRIVE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });

async function uploadToDrive(filepath, filename) {
  const fileMetadata = {
    name: filename,
    parents: [process.env.GDRIVE_FOLDER_ID],
  };

  const media = {
    mimeType: "application/json",
    body: fs.createReadStream(filepath),
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: "id",
  });

  return response.data.id;
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
    const filepath = path.join(dataDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(sessionData, null, 2));

    // Upload to Google Drive
    const fileId = await uploadToDrive(filepath, filename);

    res.json({ success: true, file: filename, driveId: fileId });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, error: "Failed to save data" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));