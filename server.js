import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/scrape", async (req, res) => {
  const { url } = req.body;

  if (!url || !/^https?:\/\/(www\.)?instagram\.com\//.test(url)) {
    return res.status(400).json({ error: "URL inválida. Debe ser de instagram.com" });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      },
    });

    const html = await response.text();

    // Extraer meta tags de la página
    const getMeta = (prop) => {
      const regex = new RegExp(
        `<meta property=["']${prop}["'] content=["']([^"']+)["']`,
        "i"
      );
      const match = html.match(regex);
      return match ? match[1] : null;
    };

    const title = getMeta("og:title");
    const description = getMeta("og:description");
    const thumbnail = getMeta("og:image");
    const video = getMeta("og:video");

    return res.json({
      success: !!video,
      title,
      description,
      thumbnail,
      videoUrl: video,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`✅ Scraper SIN Playwright corriendo en ${port}`));


