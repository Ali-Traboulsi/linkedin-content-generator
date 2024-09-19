import axios from "axios";
import dotenv from "dotenv";

dotenv.config({
  path: "../../.env",
});

export const uploadMediaToLinekedin = async ({
  ownerURN,
  file,
}: {
  ownerURN: string;
  file: Express.Multer.File;
}) => {
  try {
    const registerUploadResponse = await axios.post(
      `https://api.linkedin.com/rest/assets?action=registerUpload`,
      {
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-document"],
          owner: `urn:li:person:${ownerURN}`,
        },
        serviceRelationships: [
          {
            relationshipType: "OWNER",
            identifier: "urn:li:userGeneratedContent",
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "LinkedIn-Version": "202404",
        },
      }
    );

    const { uploadUrl, asset } = registerUploadResponse.data.value;

    const fileUploadResponse = await axios.put(uploadUrl, file.buffer, {
      headers: {
        Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
        "Content-Type": file.mimetype, // Set the correct mime type
      },
    });

    console.log("File uploaded successfully:", fileUploadResponse.data);

    return { data: { value: { asset } } };
  } catch (error) {
    console.error("Error uploading PDF to LinkedIn:", error);
  }
};
