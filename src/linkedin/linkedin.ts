import axios, { AxiosError } from "axios";
import { Request, response, Response } from "express";
import dotenv from "dotenv";
import { jwtDecode } from "jwt-decode";
import jwt from "jsonwebtoken";
import { uploadMediaToLinekedin } from "../helpers/upload-media-to-linkedin";

dotenv.config();

// const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

// console.log('Access Token:', accessToken);

// export const accessToken = async (authCode: string) => {
//     const params = new URLSearchParams();
//     params.append('grant_type', 'authorization_code');
//     params.append('code', authCode);
//     params.append('redirect_uri', 'https://oauth.pstmn.io/v1/callback');
//     params.append('client_id', '77c390pw5dz0kp');
//     params.append('client_secret', 'euUgJ0qkOHodU0gj');

//     try {
//         const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', params);
//         console.log('Access Token:', response.data.access_token);
//     } catch (error) {
//         console.error('Error fetching access token:', error);
//     }
// };

const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

export const getLinkedInConnections = async (req: Request, res: Response) => {
  try {
    console.log("Logging from getLinkedInConnections");
    console.log("Access Token:", accessToken);

    // Test fetching profile information
    const response = await axios.get(
      `${process.env.LINKEDIN_UPLOAD_BASE_URL}/me`,
      {
        headers: {
          Authorization: `Bearer AQXWO-mTQk6xbZC7Kw8huzg3mJydzQrSzARw627xc-jWIJt8OFP56gXH4sLb57_EzhXw47ANH95V3_6pHBqXsDXpB5wGoFRxCUwv7Foursx5hxueMHATjFPqV6FW7nRZapk5Ck1cTzANo__1Up31INwKg5q83mLdWG2UHBYTb6O8t_8Sy6UG1q9GUrxXvlVjOWvkq5PjcKy9ycmZVK_UZyrsuMzoX_nOZJyHBBbn9NQ_1uW_bEYFzLe75-pc8igF4nQnIQKx4EHs4FCrfsx-vI4cDG4Xc6-DfebwIvgyWZeh03hYHAicR-XIKydF-gLl6qfuDZok8q-ZhQVast_8Esyed0gs6g`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      console.error(error.name);
      console.error(error.stack);
      console.error("Error fetching LinkedIn data:", error.message);
      res.status(500).send(`Error fetching LinkedIn data: ${error.message}`);
    }
    res.status(500).send("Error fetching LinkedIn data");
  }
};

export const createLinkedinPost = async (req: Request, res: Response) => {
  console.log("Access Token:", accessToken);

  try {
    let assetUrn: string | null = null;

    // Step 1: Optional media (PDF) upload if the file is present
    const pdfFile: Express.Multer.File | undefined = req.file;

    if (pdfFile) {
      const fileUploadResponse = await uploadMediaToLinekedin({
        ownerURN: req.body.authorURN,
        file: pdfFile,
      });
      assetUrn = fileUploadResponse
        ? fileUploadResponse.data.value.asset
        : null;
    }

    const postBody = {
      author: `urn:li:person:${req.body.authorURN}`, // This is where you use the LinkedIn member URN
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: req.body.content,
          },
          shareMediaCategory: assetUrn ? "CAROUSEL" : "NONE",
          media: assetUrn
            ? [
                {
                  status: "READY",
                  description: {
                    text: req.body.pdfDescription || "PDF file",
                  },
                  media: assetUrn,
                  title: {
                    text: req.body.pdfTitle || "Attached PDF",
                  },
                },
              ]
            : [],
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": req.body.visibility,
      },
    };

    const response = await axios.post(
      `${process.env.LINKEDIN_UPLOAD_BASE_URL}/ugcPosts`,
      postBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    console.log("Post created successfully:", response.data);
    res.send(response.data);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).send({
      message: "Error fetching profile",
      error,
    });
  }
};

export const postComment = async (req: Request, res: Response) => {
  try {
    const { linkedinVersion, shareURN, commentText } = req.body;

    console.log("shareURN:", shareURN);
    console.log("commentText:", commentText);

    const commentBody = {
      actor: "urn:li:person:Smx3m-uJ9F",
      message: {
        text: commentText,
      },
    };

    const encodedShareURN = encodeURIComponent(shareURN);

    const commentPostUrl = `https://api.linkedin.com/rest/socialActions/${encodedShareURN}/comments`;

    const response = await axios.post(commentPostUrl, commentBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": linkedinVersion, // Add the LinkedIn-Version header
      },
    });

    if (response.status !== 201) {
      console.error("Error posting comment:", response.data);
      return res.status(500).send("Error posting comment");
    }

    return res.json("Comment posted successfully");
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error posting comment:", error);
      return res.status(500).send({
        message: "Error posting comment",
        error: error.response?.data,
        status: error.response?.status,
      });
    }
    if (error instanceof Error) {
      console.log("Error instance of Error");
      console.error(error);
      console.error("Error posting comment:", error.message);
      return res.status(500).send(`Error posting comment: ${error}`);
    }
    console.error("Error posting comment:", error);
    res.status(500).send("Error posting comment");
  }
};

export const decodeToken = async (req: Request, res: Response) => {
  try {
    const decodedToken = jwt.decode(req.body.idToken);
    console.log("Decoded Token:", decodedToken);
    res.json(decodedToken);
  } catch (error) {
    console.error("Error decoding token:", error);
    res.status(500).send("Error decoding token");
  }
};

// Smx3m-uJ9F
