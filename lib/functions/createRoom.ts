import { httpsCallable } from 'firebase/functions'

import { functions } from '../firebase'

export type CreateRoomRequest = {
    person: string;
}

export type CreateRoomResponse = {
  status: string
}

const CreateRoomCloudFunction = httpsCallable<
CreateRoomRequest,
CreateRoomResponse
>(functions, 'createRoom')

const createRoom = async (data: CreateRoomRequest) => {
  try {
    const response = await CreateRoomCloudFunction(data)
    return response.data
  } catch (err) {
    console.log(err)
  }
}

export default createRoom
