import {onCall, HttpsError} from "firebase-functions/v2/https";
import {firestore} from "../main.js";
import {FieldValue, Filter} from "firebase-admin/firestore";

type CreateRoomData = {
  id: string;
  person: string;
};

export const createRoom = onCall<CreateRoomData>(
  {region: "us-central1", cors: true},
  async ({auth, data: {person, id}}) => {
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

      const chatExists = await firestore
        .collection("room")
        .where(
          Filter.or(
            Filter.and(
              Filter.where("person1", "==", callerUid),
              Filter.where("person2", "==", person)
            ),
            Filter.and(
              Filter.where("person1", "==", person),
              Filter.where("person2", "==", callerUid)
            )
          )
        )
        .get();

      if (chatExists.size) {
        throw new HttpsError(
          "already-exists",
          "There is an exciting chat.",
          "There is an exciting chat."
        );
      }

      await firestore.collection("room").add({
        created_at: FieldValue.serverTimestamp(),
        id,
        person1: callerUid,
        person2: person,
        messages: [],
      });
    } catch (error) {
      console.log(error);
      throw new HttpsError(
        "internal",
        error instanceof Error ?
          error.message :
          "An error occurred while creating a new room."
      );
    }

    return {
      status: "success",
    };
  }
);
