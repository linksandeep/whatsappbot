import { Router, Request, Response } from "express";
import multer from "multer";
import xlsx from "xlsx";
import { Lead } from "../models/Lead";
import { sendTemplateMessage } from "../services/whatsapp.service";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.get("/health", (req, res) => {
  res.send("OK");
});

router.get("/helth2", async (req: Request, res: Response) => {
  res.json({
    message: "im fine",
  });
});

router.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    console.log("📂 File upload endpoint hit");

    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = xlsx.utils.sheet_to_json(sheet);

    let sent = 0;

    for (const row of rows) {
      if (!row.name || !row.phone) {
        console.log("⚠️ Skipping invalid row:", row);
        continue;
      }

      console.log("📤 Sending template to:", row.phone, row.name);

      await Lead.create({
        name: row.name,
        phone: row.phone,
        status: "SENT"
      });

      // ✅ TEMPLATE MESSAGE (SAFE FIRST CONTACT)
      await sendTemplateMessage(row.phone, row.name);
      sent++;
    }

    console.log("✅ Messages sent:", sent);

    res.json({
      message: "Template messages sent successfully",
      total: sent
    });
  }
);

export default router;
