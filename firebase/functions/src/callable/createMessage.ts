import {onCall, HttpsError} from "firebase-functions/v2/https";
import {firestore} from "../main.js";
import {FieldValue, Filter} from "firebase-admin/firestore";

type CreateMessageData = {
  person1: string;
  person2: string;
  message: string;
  type: "image" | "text" | "audio"
}

export const createMessage = onCall<CreateMessageData>(
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

      const roomRef = await firestore
        .collection("room")
        .where(
          Filter.or(
            Filter.where("person1", "==", callerUid),
            Filter.where("person2", "==", callerUid)
          ))
        .get();

      firestore.runTransaction(async (transaction) => {
        transaction.update(roomRef.docs[0].ref, {
          messages: FieldValue.arrayUnion({
            content: data.message,
            sender: callerUid,
            type: data.type,
          }),
        });
      });
    } catch (error) {
      console.log(error);
      throw new HttpsError(
        "internal",
        error instanceof Error ?
          error.message :
          "An error occurred while sending a new message."
      );
    }

    return {
      status: "success",
    };
  }
);
