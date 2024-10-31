import { Auth, User } from "firebase/auth"

export type AuthContextValue = {
    auth: Auth;
    user: User | null;
    isLoading: boolean;
    logOut: () => void;
}