import { httpsCallable } from 'firebase/functions'

import { functions } from '../firebase'

export type GetAllUsersResponse = {
    displayName?: string;
    uid: string;
    photoURL?: string;
}

const GetAllUsersCloudFunction = httpsCallable<undefined, GetAllUsersResponse[]>(functions, 'getAllUsers')

const getAllUsers = async () => {
  try {
    const response = await GetAllUsersCloudFunction();
    return response.data
  } catch (err) {
    console.log(err)
  }
}

export default getAllUsers
