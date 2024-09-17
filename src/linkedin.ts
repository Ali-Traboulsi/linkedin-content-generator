import axios, { AxiosError } from "axios";
import { Request, response, Response } from "express";
import dotenv from "dotenv";
import { jwtDecode } from "jwt-decode";
import jwt from "jsonwebtoken";

dotenv.config();

const linkedInAPIBase = "https://api.linkedin.com/v2";

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
    const response = await axios.get(`${linkedInAPIBase}/me`, {
      headers: {
        Authorization: `Bearer AQXWO-mTQk6xbZC7Kw8huzg3mJydzQrSzARw627xc-jWIJt8OFP56gXH4sLb57_EzhXw47ANH95V3_6pHBqXsDXpB5wGoFRxCUwv7Foursx5hxueMHATjFPqV6FW7nRZapk5Ck1cTzANo__1Up31INwKg5q83mLdWG2UHBYTb6O8t_8Sy6UG1q9GUrxXvlVjOWvkq5PjcKy9ycmZVK_UZyrsuMzoX_nOZJyHBBbn9NQ_1uW_bEYFzLe75-pc8igF4nQnIQKx4EHs4FCrfsx-vI4cDG4Xc6-DfebwIvgyWZeh03hYHAicR-XIKydF-gLl6qfuDZok8q-ZhQVast_8Esyed0gs6g`,
      },
    });

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
    const postBody = {
      author: "urn:li:person:Smx3m-uJ9F", // This is where you use the LinkedIn member URN
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: "This is a second test post from the LinkedIn API.",
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    const response = await axios.post(`${linkedInAPIBase}/ugcPosts`, postBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });

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
    const decodedToken = jwt.decode(
      "eyJ6aXAiOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImQ5Mjk2NjhhLWJhYjEtNGM2OS05NTk4LTQzNzMxNDk3MjNmZiIsImFsZyI6IlJTMjU2In0.eyJpc3MiOiJodHRwczovL3d3dy5saW5rZWRpbi5jb20vb2F1dGgiLCJhdWQiOiI3N2MzOTBwdzVkejBrcCIsImlhdCI6MTcyNjQ3MTAyNSwiZXhwIjoxNzI2NDc0NjI1LCJzdWIiOiJTbXgzbS11SjlGIiwibmFtZSI6IkFsaSBUcmFib3Vsc2kiLCJnaXZlbl9uYW1lIjoiQWxpIiwiZmFtaWx5X25hbWUiOiJUcmFib3Vsc2kiLCJwaWN0dXJlIjoiaHR0cHM6Ly9tZWRpYS5saWNkbi5jb20vZG1zL2ltYWdlL3YyL0Q0RDAzQVFGY0lLWnZzRUltT2cvcHJvZmlsZS1kaXNwbGF5cGhvdG8tc2hyaW5rXzEwMF8xMDAvcHJvZmlsZS1kaXNwbGF5cGhvdG8tc2hyaW5rXzEwMF8xMDAvMC8xNzIwMjk4MzIxNzU3P2U9MjE0NzQ4MzY0NyZ2PWJldGEmdD16eHFkLVJfNDQtenc5ajJkclJFbGlpNDFZY21TTlBqZGRvLWJ4ZEpqanNFIiwiZW1haWwiOiJhbGkuaC50cmFib3Vsc2lAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOiJ0cnVlIiwibG9jYWxlIjoiZW5fVVMifQ.UFE5494Vp_ZbBaYT9_BxgJ7B9RvPkqK_exiBTeHu_N-VYcsWv8htyU23dlmiUbinBJzsT6G9A9kidk43Qb5ngS76yXMh0dnbm2eD8931C1agyrNnouxJQhc7Ksd9ZxoLbfsmpJMd1TSbjpFRiqg3qp1A4T_eq4oD7ADN2yLk2szzhViTAFNK2HRZQoIumihS5iI21ddYPrcCvS1NoLIfYmbSqShGOPaM7G-fcQbCS5rknsd86V6HUR5WNwR2YCcb8pS8aaKsZukd1FT7qqy3EnhIIqhuodsFbobbCBG1JCxWWRub7HaFmdj8Rhj3PwPv4Yxim6VULh6_Qs-i4kBPhnPLMQwc1gmeCo4bBzCsWoN1P0pA5To6b7Ze8N8Lb8Gxjglq4O-t2D_9aOp8I3cf8yOv9Y2o2pSXJ0abpgRAKiNvlRD_o4g66-OqpXPrjV5Yr3vKbQ0TdoK2CH7Lnmh3dN7vGuqn9OGC9wjvl5wqU7USpL-k8qnyB36y6qjRplRxhPejUJk9mVI1mcvnmLRHF2u_mYHpZeSj1yl00liZG3L8sZfHqcshufxJl4Z0fhJYS6oaOBf0C14Yt_vkjUmc-QLU9FWvQ_IXJEsQficbD13pPZFxpIvb9JxoSbeRJMUfghmBu01jI9xIQoUvioqKm4QxW1N8Y2BU34JoA4Qv7oo"
    );
    console.log("Decoded Token:", decodedToken);
    res.json(decodedToken);
  } catch (error) {
    console.error("Error decoding token:", error);
    res.status(500).send("Error decoding token");
  }
};
