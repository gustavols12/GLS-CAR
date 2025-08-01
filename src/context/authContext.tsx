import { onAuthStateChanged } from "firebase/auth";
import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { auth } from "../services/firebaseConnection";

interface AuthProviderProps {
  children: ReactNode;
}
type AuthContextData = {
  signed: boolean;
  loading?: boolean;
  handleInfoUser: ({ name, email, uid }: UserProps) => void;
  user: UserProps | null;
};

interface UserProps {
  uid: string;
  name: string | null;
  email: string | null;
}

export const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          name: user?.displayName,
          email: user?.email,
        });
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => {
      unsub();
    };
  }, []);

  function handleInfoUser({ name, email, uid }: UserProps) {
    setUser({
      uid,
      name,
      email,
    });
  }

  return (
    <AuthContext.Provider
      value={{ signed: !!user, loading, handleInfoUser, user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
