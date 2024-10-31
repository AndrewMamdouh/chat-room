import { httpsCallable } from "firebase/functions";

import { functions } from "../firebase";

export type GetChatRequest = {
  person: string;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  sender: string;
  receiverId: string;
  receiver: string;
  content: string;
  type: "image" | "text" | "audio";
};

export type GetChatResponse = {
  id: string;
  messages: ChatMessage[];
};

const GetChatCloudFunction = httpsCallable<
  GetChatRequest,
  GetChatResponse | null
>(functions, "getChat");

const getChat = async (data: GetChatRequest) => {
  try {
    const response = await GetChatCloudFunction(data);
    return response.data;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export default getChat;
