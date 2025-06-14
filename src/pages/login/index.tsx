import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "../../components/container";
import { Input } from "../../components/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../services/firebaseConnection";
import toast from "react-hot-toast";

const schema = z.object({
  email: z.string().email("Email inválido").nonempty("Campo obrigatório"),
  password: z.string().nonempty("Campo obrigatório"),
});

type FormData = z.infer<typeof schema>;

export function Login() {
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
    signInWithEmailAndPassword(auth, data.email, data.password)
      .then(() => {
        toast.success("Logado com sucesso!");
        navigate("/", { replace: true });
      })
      .catch((error) => {
        console.error("Erro ao logar:", error);
        toast.error("Erro ao fazer login.");
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
            Acessar
          </button>
        </form>
        <div className="flex gap-2 mt-4">
          <span className="text-gray-500">Não tem uma conta?</span>
          <Link
            to="/register"
            className="text-red-500 font-bold hover:text-red-700"
          >
            Cadastre-se
          </Link>
        </div>
      </div>
    </Container>
  );
}
