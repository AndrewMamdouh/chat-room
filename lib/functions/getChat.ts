import { httpsCallable } from 'firebase/functions'

import { functions } from '../firebase'

export type GetChatResponse = {
    sender: string;
    message: string;
    type: string;
}

const GetChatCloudFunction = httpsCallable<undefined, GetChatResponse[]>(functions, 'getChat')

const getChat = async () => {
  try {
    const response = await GetChatCloudFunction();
    return response.data
  } catch (err) {
    console.log(err)
  }
}

export default getChat
