import {onCall, HttpsError} from "firebase-functions/v2/https";
import {firestore} from "../main.js";
import {FieldValue, Filter} from "firebase-admin/firestore";

type CreateMessageData = {
  id: string;
  receiver: string;
  content: string;
  type: "image" | "text" | "audio"
}

export const createMessage = onCall<CreateMessageData>(
  {region: "us-central1", cors: true},
  async ({auth, data: {id, receiver, content, type}}) => {
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
            id,
            content,
            sender: callerUid,
            receiver,
            type,
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
