import { Link } from "react-router-dom";
import { FiUser, FiLogIn } from "react-icons/fi";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";

export function Header() {
  const { signed, loading } = useContext(AuthContext);

  return (
    <div className="w-full flex items-center justify-center h-16 bg-white drop-shadow mb-4">
      <header className="w-full max-w-7xl flex justify-between items-center px-4 mx-auto">
        <Link
          to="/"
          className=" bg-red-500 text-white text-2xl italic font-bold p-2 rounded "
        >
          <span className="text-black">GLS</span>Carros
        </Link>
        {!loading && signed && (
          <div className="border-2 rounded-full p-1 border-gray-900">
            <Link to="/dashboard">
              <FiUser size={24} color="#000" />
            </Link>
          </div>
        )}
        {!loading && !signed && (
          <Link to="/login">
            <FiLogIn size={24} color="#000" />
          </Link>
        )}
      </header>
    </div>
  );
}
