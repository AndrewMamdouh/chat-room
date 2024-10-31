import { createContext, useContext } from 'react'

import { auth } from '@Lib/firebase'
import { AuthContextValue } from '@Types'

export const AuthContext = createContext<AuthContextValue>({
  auth: auth,
  user: null,
  isLoading: true,
  logOut: () => null,
})

export const AuthContextProvider = AuthContext.Provider

export const useAuthContext = () => useContext(AuthContext)
