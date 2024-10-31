import {onCall, HttpsError} from "firebase-functions/v2/https";
import {auth as Auth} from "../main.js";


export const getAllUsers = onCall(
  {region: "us-central-1"},
  async ({auth}) => {
    try {
      // Checking that the user calling the Cloud Function is authenticated
      if (!auth) {
        throw new HttpsError(
          "unauthenticated",
          "The user is not authenticated.",
          "The user is not authenticated."
        );
      }
      const allUsers = await Auth.listUsers();
      const nomalizedUsers = allUsers.users.map(
        ({displayName, uid, photoURL}) => ({
          displayName, uid, photoURL,
        })
      );
      return nomalizedUsers;
    } catch (error) {
      console.log(error);
      throw new HttpsError(
        "internal",
        error instanceof Error ?
          error.message :
          "An error occurred while searching for users."
      );
    }
  }
);
