import {onCall, HttpsError} from "firebase-functions/v2/https";
import {firestore} from "../main.js";
import {Filter} from "firebase-admin/firestore";

type GetChatData = {
  person1: string;
  person2: string;
}

export const getChat = onCall<GetChatData>(
  {region: "us-central-1"},
  async ({auth, data}) => {
    try {
      // Checking that the user calling the Cloud Function is authenticated
      if (!auth) {
        throw new HttpsError(
          "unauthenticated",
          "The user is not authenticated.",
          "The user is not authenticated."
        );
      }

      const callerUid = auth.uid;

      if (![data.person1, data.person2].includes(callerUid)) {
        throw new HttpsError(
          "permission-denied",
          "The user is not authorized.",
          "The user is not authorized."
        );
      }

      const roomExists = await firestore
        .collection("room")
        .where(Filter.or(
          Filter.where("person1", "==", callerUid),
          Filter.where("person2", "==", callerUid),
        ))
        .get();

      if (!roomExists.size) {
        throw new HttpsError(
          "not-found",
          "Chat doesn't exist.",
          "Chat doesn't exist."
        );
      }

      const roomData = roomExists.docs[0].data();

      return roomData.messages;
    } catch (error) {
      console.log(error);
      throw new HttpsError(
        "internal",
        error instanceof Error ?
          error.message :
          "An error occurred while creating a new room."
      );
    }
  }
);
