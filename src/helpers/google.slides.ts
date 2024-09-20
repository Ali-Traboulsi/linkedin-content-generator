import { google } from "googleapis";
import { auth } from "google-auth-library";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

console.log("Google Client ID:", process.env.GOOGLE_API_CLIENT_ID);
console.log("Google Client Secret:", process.env.GOOGLE_API_CLIENT_SECRET);
console.log("Google Redirect URI:", process.env.GOOGLE_API_REDIRECT_URI);

const oauth2client = new google.auth.OAuth2(
  `${process.env.GOOGLE_API_CLIENT_ID}`,
  `${process.env.GOOGLE_API_CLIENT_SECRET}`,
  `${process.env.GOOGLE_API_REDIRECT_URI}`
);

console.log("OAuth2 Client:", oauth2client);

oauth2client.setCredentials({
  access_token: `${process.env.GOOGLE_API_ACCESS_TOKEN}`,
  refresh_token: `${process.env.GOOGLE_API_REFRESH_TOKEN}`,
  scope: "https://www.googleapis.com/auth/presentations",
  token_type: "Bearer",
  expiry_date: 1234567890, // You may need to include this
});

// Generate an authentication URL to get consent from the user
const getAuthUrl = () => {
  const scopes = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/presentations", // For Google Slides API
    "https://www.googleapis.com/auth/spreadsheets",
  ];

  const authUrl = oauth2client.generateAuthUrl({
    access_type: "offline", // This ensures we get a refresh token
    scope: scopes,
  });

  console.log("Authorize this app by visiting this URL:", authUrl);
};

// Exchange the authorization code for tokens
const getAccessToken = async (code: string) => {
  try {
    const { tokens } = await oauth2client.getToken(code);
    console.log("Access Token:", tokens.access_token);
    console.log("Refresh Token:", tokens.refresh_token); // Store this for future use
    console.log("Token Expiry:", tokens.expiry_date);

    // Set the tokens to the OAuth2 client
    oauth2client.setCredentials(tokens);
  } catch (error) {
    console.error("Error retrieving access token:", error);
  }
};

// Step 1: Generate the auth URL and visit it in your browser
// getAuthUrl();

// getAccessToken(`${process.env.GOOGLE_API_REFRESH_TOKEN}`);

async function createPresentation(accessToken: string) {
  const service = google.slides({ version: "v1" });

  try {
    const presentation = await service.presentations.create({
      access_token: accessToken,
      requestBody: {
        title: "My Presentation",
      },
      auth: oauth2client,
    });

    console.log("Presentation created:", presentation.data);
    return presentation.data;
  } catch (error) {
    console.error("Error creating presentation:", error);
  }
}

const getPresentationFileInfo = async (presentationId: string) => {
  const drive = google.drive({ version: "v3", auth: oauth2client });

  try {
    const file = await drive.files.get({
      fileId: presentationId,
      fields: "id, name, parents, webViewLink",
    });

    console.log("File details:", file.data);
    console.log("File URL:", file.data.webViewLink);
  } catch (error) {
    console.error("Error retrieving file:", error);
  }
};

// createPresentation(`${process.env.GOOGLE_API_ACCESS_TOKEN}`);

getPresentationFileInfo("1mL7Pt8GqNukgTmxQ_eOpLFKYsuOE6N3B-xAkUierTkU");
