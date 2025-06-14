import type { ReactNode } from "react";
import { useContext } from "react";
import { Navigate } from "react-router-dom";

import { AuthContext } from "../context/authContext";

interface PrivateProps {
  children: ReactNode;
}

export function Private({ children }: PrivateProps): any {
  const { signed, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!signed) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
