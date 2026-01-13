import { Router, Request, Response } from "express";
import multer from "multer";
import xlsx from "xlsx";
import { Lead } from "../models/Lead";
import { sendWhatsAppMessage } from "../services/whatsapp.service";

const router = Router();
const upload = multer({ dest: "uploads/" });


router.get("/health", (req, res) => {
  res.send("OK");
});




router.get("/helth2",
async (req: Request, res: Response) => {

  res.json({
    message: "im fine",
  });
}
)

router.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {

    console.log("file upde")
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = xlsx.utils.sheet_to_json(sheet);

    let sent = 0;

    for (const row of rows) {
      if (!row.name || !row.phone) continue;

      await Lead.create({
        name: row.name,
        phone: row.phone,
        status: "SENT"
      });

      await sendWhatsAppMessage(row.phone,row.name);
      sent++;
    }

    res.json({
      message: "Messages sent successfully",
      total: sent
    });
  }
);

export default router;
