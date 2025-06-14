import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "../../components/container";
import { Input } from "../../components/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { auth } from "../../services/firebaseConnection";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";

import { AuthContext } from "../../context/authContext";
import { useContext } from "react";
import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().nonempty("Informe seu nome"),
  email: z.string().email("Email inválido").nonempty("Campo obrigatório"),
  password: z
    .string()
    .min(6, "A senha precisa ter pelo menos 6 caracteres")
    .nonempty("Campo obrigatório"),
});

type FormData = z.infer<typeof schema>;

export function Register() {
  const { handleInfoUser } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });
  const navigate = useNavigate();

  useEffect(() => {
    async function handleLogout() {
      await signOut(auth);
    }
    handleLogout();
  }, []);

  async function onSubmit(data: FormData) {
    createUserWithEmailAndPassword(auth, data.email, data.password)
      .then(async (user) => {
        await updateProfile(user.user, {
          displayName: data.name,
        });
        handleInfoUser({
          name: data.name,
          email: data.email,
          uid: user.user.uid,
        });
        toast.success("Cadastrado com sucesso!");
        navigate("/dashboard", { replace: true });
      })
      .catch((error) => {
        console.error("Erro ao cadastrar:", error);
        toast.error("Erro ao cadastrar usuário.");
      });
  }
  return (
    <Container>
      <div className="w-full min-h-screen flex justify-center items-center flex-col gap-4">
        <Link
          to="/"
          className=" bg-red-500 text-white text-3xl italic font-bold p-2 rounded  mb-6 max-w-sm"
        >
          <span className="text-black">GLS</span>Carros
        </Link>

        <form
          className="w-full max-w-lg bg-white p-4 rounded"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-3">
            <Input
              type="text"
              placeholder="Informe sua nome"
              name="name"
              error={errors.name?.message}
              register={register}
            />
          </div>

          <div className="mb-3">
            <Input
              type="email"
              placeholder="Informe seu email"
              name="email"
              error={errors.email?.message}
              register={register}
            />
          </div>
          <div className="mb-3">
            <Input
              type="password"
              placeholder="Informe sua senha"
              name="password"
              error={errors.password?.message}
              register={register}
            />
          </div>

          <button
            type="submit"
            className="bg-zinc-900 w-full rounded-md text-white font-medium h-10"
          >
            cadastrar
          </button>
        </form>
        <div className="flex gap-2 mt-4">
          <span>Já tem uma conta?</span>
          <Link
            to="/login"
            className="text-red-500 font-bold hover:text-red-700"
          >
            Faça login
          </Link>
        </div>
      </div>
    </Container>
  );
}
