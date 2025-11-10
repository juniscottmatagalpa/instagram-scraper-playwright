import express from "express";
import bodyParser from "body-parser";
import { chromium } from "playwright";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/scrape", async (req, res) => {
  const { url } = req.body;
  if (!url || !/^https?:\/\/(www\.)?instagram\.com\//.test(url)) {
    return res.status(400).json({ error: "URL inválida. Debe ser de instagram.com" });
  }

  let browser;
  try {
    browser = await chromium.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    });

    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1000);

    const meta = await page.evaluate(() => {
      const get = (p) => document.querySelector(`meta[property='${p}']`)?.content || null;
      return {
        title: get("og:title"),
        description: get("og:description"),
        thumbnail: get("og:image"),
        video: get("og:video"),
      };
    });

    res.json({
      success: !!meta.video,
      title: meta.title,
      description: meta.description,
      thumbnail: meta.thumbnail,
      videoUrl: meta.video,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("✅ Scraper ejecutándose en puerto", port));
