require("dotenv").config();
console.log("Loaded API Key:", process.env.OPENAI_API_KEY); // Debugging step
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const OpenAI = require("openai");

const { google } = require("googleapis");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const factCheck = google.factchecktools({
    version: "v1alpha1",
    auth: process.env.GOOGLE_FACT_CHECK_API_KEY,
});

// Extract claims and search terms using ChatGPT
async function getClaimsFromChatGPT(text) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are an AI that extracts claims and search terms from text." },
                { role: "user", content: `Extract up to 5 claims and their corresponding search terms from the following text:\n\n${text}` }
            ],
            max_tokens: 150,
        });

        console.log("API Response:", response); // Log the full response to inspect it

        // Make sure response.choices exists and has the expected structure
        if (response && response.choices && response.choices.length > 0) {
            // Access message.content instead of text
            const claimsText = response.choices[0].message.content.trim();
            const claims = claimsText.split("\n").filter(claim => claim);

            // Extract search terms from claims
            const searchTerms = claims.map(claim => {
                const match = claim.match(/"(.*?)"/);
                return match ? match[1] : claim;
            });

            return { claims, searchTerms };
        } else {
            console.error("No choices found in the API response");
            return { claims: [], searchTerms: [] };
        }
    } catch (error) {
        console.error("Error with OpenAI API:", error);
        return { claims: [], searchTerms: [] };
    }
}

// Verify claims using Google Fact Check
async function verifyClaimsWithGoogleFactCheck(claims) {
    const results = [];
    for (const claim of claims) {
        try {
            const response = await factCheck.claims.search({ query: claim });
            const claimReview = response.data.claims?.[0]?.claimReview?.[0];

            if (claimReview) {
                results.push({
                    claim,
                    source: "Google Fact Check",
                    review: claimReview.textualRating,
                    url: claimReview.url,
                });
            }
        } catch (error) {
            console.error(`Google Fact Check error for claim "${claim}":`, error);
        }
    }
    return results;
}

// Fake News Verification Route
app.post("/verify", async (req, res) => {
    try {
        const userInput = req.body.text;

        // Step 1: Extract claims and search terms using ChatGPT
        const { claims, searchTerms } = await getClaimsFromChatGPT(userInput);

        // Step 2: Verify claims using Google Fact Check
        const googleFactCheckResults = await verifyClaimsWithGoogleFactCheck(claims);

        res.json({ success: true, results: googleFactCheckResults });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
