import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialize express app
const app = express();
const PORT = 3000;

// Increase body limit to support base64 image uploads
app.use(express.json({ limit: "25mb" }));

// Lazy initializer for the GoogleGenAI SDK to prevent startup crashes when the API key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined in the settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST API endpoint for scanning magnet fishing finds
app.post("/api/scan", async (req, res) => {
  try {
    const { imageBase64, imageUrl, mimeType } = req.body;

    if (!imageBase64 && !imageUrl) {
      return res.status(400).json({ error: "Geen afbeelding of URL ontvangen." });
    }

    const ai = getAiClient();

    // Set up the parts for Gemini (from Base64 or remote URL)
    let imagePart;
    if (imageBase64) {
      imagePart = {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: imageBase64,
        },
      };
    } else {
      console.log(`Preset laden via URL: ${imageUrl}`);
      const imageUrlResponse = await fetch(imageUrl);
      if (!imageUrlResponse.ok) {
        throw new Error(`Fout bij laden van testafbeelding van URL. Status: ${imageUrlResponse.status}`);
      }
      const arrayBuffer = await imageUrlResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");
      const contentType = imageUrlResponse.headers.get("content-type") || "image/jpeg";
      imagePart = {
        inlineData: {
          mimeType: contentType,
          data: base64,
        },
      };
    }

    const promptText = `
Je bent een absolute topexpert in archeologie, metallurgie, historische militaria en de identificatie van metalen voorwerpen die door magneetvissers uit het water zijn gehaald.
Vondsten die lange tijd onder water hebben gelegen zijn vrijwel altijd extreem gecorrodeerd, verroest, of omhuld door een dikke laag slib en kalksteenachtige afzettingen (concreties).

Jouw taak is om de afbeelding uiterst nauwkeurig te scannen en een 100% realistische, wetenschappelijk onderbouwde identificatie te geven van het specifieke voorwerp. 

Volg deze strikte richtlijnen bij de analyse:
1. ONTDEK STRUCTUUR: Kijk door de roest heen. Analyseer de fundamentele contouren, verhoudingen, symmetrie, de aanwezigheid van lasnaden, klinknagels, schroefdraden, specifieke mechanische delen (zoals een slagpin, trekker, handvat, oogjes of scharnieren).
2. GEEN VAGE ANTWOORDEN: Geef geen algemene beschrijvingen zoals 'een stuk metaal'. Kom tot een specifieke, deskundige conclusie (bijvoorbeeld: 'Duitse mortiergranaat 8cm uit WO2', '17e-eeuws handgesmeed hoefijzer', 'klassieke gietijzeren penslot kluis' of 'antieke gietijzeren weegschaal-gewicht'). Indien er twijfel is, benoem dan de meest waarschijnlijke optie op basis van metallurgische eigenschappen.
3. ZEER DETECTIEF-ACHTIG: Verklaar in de "beschrijving" exact welke visuele bewijzen of kenmerken (zoals de vorm van de vinnen, diameter, materiaaldikte of mechanische details) jouw identificatie ondersteunen en hoe de magneetvisser dit kan verifiëren.
4. VEILIGHEID EERST: Als de geometrie ook maar enigszins wijst op een explosief (mortier, granaat, patroon, bommen van WO1/WO2) of een modern/antiek vuurwapen, markeer "gevaarlijk" dan ALTIJD als true. Wees liever te voorzichtig dan te laks.
5. REALISTISCHE WAARDESCHATTING: Schat de geldwaarde of verzamelaarswaarde van het voorwerp in euro's in de huidige (zwaar gecorrodeerde) staat. Geef dit op als een concreet bereik (bijv. € 30 - € 80) of leg helder uit als het geen handelswaarde heeft (bijv. 'Geen commerciële waarde, puur historische waarde' of 'Onschatbare historische waarde / Museale vondst').

Geef je reactie uitsluitend in het Nederlands en exact volgens de gevraagde JSON-structuur. Het antwoord moet 100% valide JSON zijn.
`;

    // Try multiple models in case one is experiencing high demand (503 UNAVAILABLE)
    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
    let lastError: any = null;
    let response: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Scannen met model: ${modelName}...`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [imagePart, { text: promptText }],
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              required: [
                "vondstType",
                "naam",
                "gevaarlijk",
                "beschrijving",
                "roestNiveau",
                "historischeSchatting",
                "materiaal",
                "tips",
                "geschatteWaarde",
              ],
              properties: {
                vondstType: {
                  type: "STRING",
                  description: "Categorie van de vondst (bijv: Militaria, Gereedschap, Kluis, Fiets, Huishoudelijk, Onbekend)",
                },
                naam: {
                  type: "STRING",
                  description: "Specifieke naam of identificatie van het voorwerp (bijv: WW2 Duitse Mortiergranaat, 19e-eeuwse Hoefijzer)",
                },
                gevaarlijk: {
                  type: "BOOLEAN",
                  description: "Waar als het munitie, vuurwapens of andere potentieel gevaarlijke munitie betreft.",
                },
                beschrijving: {
                  type: "STRING",
                  description: "Een gedetailleerde, professionele beschrijving over wat het voorwerp is, waar het voor diende en hoe je dit herkent onder de roest.",
                },
                roestNiveau: {
                  type: "STRING",
                  description: "De geschatte hoeveelheid roestcorrosie op een schaal van 'Laag', 'Gemiddeld' of 'Extreem'.",
                },
                historischeSchatting: {
                  type: "STRING",
                  description: "De geschatte periode of herkomst (bijv: Tweede Wereldoorlog, Begin 20e eeuw, Recent, Romeins).",
                },
                materiaal: {
                  type: "STRING",
                  description: "Welk metaalsoort of materiaal het waarschijnlijk overblijft (bijv: Gietijzer, Smeedijzer, Staal, messing).",
                },
                tips: {
                  type: "ARRAY",
                  items: {
                    type: "STRING",
                  },
                  description: "Praktische en bruikbare stappen voor de vinder (bijv. EOD bellen bij gevaar, reinigingstips zoals elektrolyse). Minimaal 2 en maximaal 4 tips.",
                },
                geschatteWaarde: {
                  type: "STRING",
                  description: "De geschatte reële handels- of verzamelaarswaarde van het voorwerp in euro's in deze verroeste staat, of een toelichting bij ontbreken van commerciële waarde (bijv: € 15 - € 35, of Onschatbare historische waarde, of Geen commerciële waarde).",
                },
              },
            },
          },
        });

        if (response) {
          console.log(`Scan succesvol afgerond met model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.warn(`Poging met model ${modelName} mislukt:`, err?.message || err);
        lastError = err;
        // Wacht kort voor de volgende poging
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!response) {
      throw lastError || new Error("Alle beschikbare Gemini modellen zijn momenteel overbelast of onbereikbaar.");
    }

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Geen antwoord ontvangen van de AI.");
    }

    // Parse the output as JSON to guarantee clean delivery or fallback if something went wrong inside parsing
    try {
      const parsedData = JSON.parse(outputText);
      res.json(parsedData);
    } catch (parseError) {
      console.error("Fout bij parsen JSON:", outputText, parseError);
      res.status(500).json({
        error: "Er is een fout opgetreden bij het verwerken van het AI antwoord.",
        raw: outputText,
      });
    }
  } catch (error: any) {
    console.error("Fout in /api/scan endpoint:", error);
    res.status(500).json({ error: error?.message || "Interne serverfout bij scannen." });
  }
});

// Configure Vite or Static server
async function setupViteAndListen() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode with Vite Dev Server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev server middleware geladen.");
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Productie statische bestanden geconfigureerd uit dist/.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Magneetvondst AI Scanner draait op http://0.0.0.0:${PORT}`);
  });
}

setupViteAndListen();
