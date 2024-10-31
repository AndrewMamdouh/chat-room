import {onCall, HttpsError} from "firebase-functions/v2/https";
import {firestore, auth as Auth} from "../main.js";
import {Filter} from "firebase-admin/firestore";

type GetChatData = {
  person: string;
};

export const getChat = onCall<GetChatData>(
  {region: "us-central1", cors: true},
  async ({auth, data: {person}}) => {
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

      const roomExists = await firestore
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

      if (!roomExists.size) {
        throw new HttpsError(
          "not-found",
          "Chat doesn't exist.",
          "Chat doesn't exist."
        );
      }

      let {messages, id} = roomExists.docs[0].data();

      if (messages.length) {
        const callerUidDisplayName = (
          await Auth.getUser(
            callerUid
          )
        ).displayName;
        const otherPersonDisplayName = (
          await Auth.getUser(
            messages[0].sender === callerUid ?
              messages[0].receiver : messages[0].sender
          )
        ).displayName;
        messages = messages.map((
          {receiver, sender, ...rest}: Record<string, unknown>
        ) => ({
          receiverId: receiver,
          receiver: receiver === callerUid ?
            callerUidDisplayName : otherPersonDisplayName,
          senderId: sender,
          sender: sender === callerUid ?
            callerUidDisplayName : otherPersonDisplayName,
          ...rest,
        }));
      }

      return {id, messages};
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
