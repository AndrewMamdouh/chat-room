import { httpsCallable } from 'firebase/functions'

import { functions } from '../firebase'

export type CreateMessageRequest = {
    person1: string;
    person2: string;
    message: string;
    type: 'image' | 'text' | 'audio'
}

export type CreateMessageResponse = {
  status: string
}

const createMessageCloudFunction = httpsCallable<
CreateMessageRequest,
CreateMessageResponse
>(functions, 'createMessage')

const createMessage = async (data: CreateMessageRequest) => {
  try {
    const response = await createMessageCloudFunction(data)
    return response.data
  } catch (err) {
    console.log(err)
  }
}

export default createMessage
