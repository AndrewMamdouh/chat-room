"use client";

import { ReactNode, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'

import { auth } from '@Lib/firebase'
import { AuthContextValue } from '@Types';
import { AuthContextProvider } from '@Contexts';

type AuthProviderProps = {
    children: ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setIsLoading(false)
    })
    return unsubscribe
  }, [])

  const value: AuthContextValue = useMemo(
    () => ({
      auth,
      user,
      isLoading,
      logOut: () => auth.signOut(),
    }),
    [user, isLoading]
  )

  return <AuthContextProvider value={value}>{children}</AuthContextProvider>
}

export default AuthProvider
