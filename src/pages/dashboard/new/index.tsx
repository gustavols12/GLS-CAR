import { FiTrash, FiUpload } from 'react-icons/fi';
import { Container } from '../../../components/container';
import { DashboardHeader } from '../../../components/painelHeader';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../components/input';
import { useState, useContext } from 'react';
import type { ChangeEvent } from 'react';
import { AuthContext } from '../../../context/authContext';
import { v4 as uuidV4 } from 'uuid';
import { storage, db } from '../../../services/firebaseConnection';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().nonempty('Campo nome é obrigatório'),
  model: z.string().nonempty('Campo modelo é obrigatório'),
  year: z.string().nonempty('Campo Ano é obrigatório'),
  km: z.string().nonempty('Campo KM é obrigatório'),
  price: z.string().nonempty('Campo Preço é obrigatório'),
  city: z.string().nonempty('Campo Cidade é obrigatório'),
  whatsapp: z
    .string()
    .min(1, 'Campo WhatsApp é obrigatório')
    .refine((value) => /^(\d{10,12})$/.test(value), {
      message: 'WhatsApp deve conter apenas números e ter 10 ou 11 dígitos',
    }),
  description: z.string().nonempty('Campo descrição é obrigatório'),
});

type FormData = z.infer<typeof schema>;
interface imageItemProps {
  uid: string;
  name: string;
  url: string;
  previewUrl: string;
}

export function New() {
  const { user } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const [carImages, setCarImages] = useState<imageItemProps[]>([]);

  function onSubmit(data: FormData) {
    if (carImages.length === 0) {
      toast.error('Por favor, envie pelo menos uma imagem do carro.');
      return;
    }

    const carListImage = carImages.map((car) => {
      return {
        uid: car.uid,
        name: car.name,
        url: car.url,
      };
    });

    addDoc(collection(db, 'cars'), {
      name: data.name.toUpperCase(),
      model: data.model,
      year: data.year,
      km: data.km,
      price: data.price,
      city: data.city,
      whatsapp: data.whatsapp,
      description: data.description,
      images: carListImage,
      created: new Date(),
      owner: user?.name,
      uid: user?.uid,
    })
      .then(() => {
        reset();
        setCarImages([]);
        toast.success('Carro cadastrado com sucesso!');
      })
      .catch((error) => {
        console.error('Erro ao cadastrar carro:', error);
        toast.error('Erro ao cadastrar carro.');
      });
  }

  // 🛠️ FUNÇÃO CORRIGIDA: Valida tipo de arquivo antes de iniciar o upload
  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const image = e.target.files[0];

      if (image.type !== 'image/jpeg' && image.type !== 'image/png') {
        toast.error('Por favor, envie uma imagem no formato JPEG ou PNG.');
        e.target.value = '';
        return;
      }

      await handleUpload(image);
    }
  }

  async function handleUpload(image: File) {
    if (!user?.uid) {
      toast.error('Usuário não autenticado. Faça login novamente.');
      return;
    }
    const currentUid = user.uid;
    const uidImage = uuidV4();

    const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`);

    try {
      const snapshot = await uploadBytes(uploadRef, image);
      const downLoadUrl = await getDownloadURL(snapshot.ref);

      const imageItem: imageItemProps = {
        name: uidImage,
        uid: currentUid,
        url: downLoadUrl,
        previewUrl: URL.createObjectURL(image),
      };

      setCarImages((images) => [...images, imageItem]);
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast.error('Falha ao fazer upload da imagem. Tente novamente.');
    }
  }

  async function handleDeleteImage(item: imageItemProps) {
    const imagePath = `images/${item.uid}/${item.name}`;
    const imageRef = ref(storage, imagePath);
    try {
      await deleteObject(imageRef);
      setCarImages(carImages.filter((car) => car.url !== item.url));
      toast.success('Imagem excluída!');
    } catch (error) {
      console.error('Erro ao excluir a imagem:', error);
      toast.error('Erro ao excluir a imagem.');
    }
  }

  return (
    <Container>
      <DashboardHeader />
      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 ">
        <button className="border-2 border-gray-600 w-48 md:w-48 h-32 rounded-lg flex items-center justify-center cursor-pointer">
          <div className="absolute cursor-pointer">
            <FiUpload size={30} color="#000" />
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              className="opacity-0 cursor-pointer"
              onChange={handleFile}
            />
          </div>
        </button>

        {carImages.map((item) => (
          <div
            key={item.name}
            className="w-full h-32 flex items-center justify-center relative"
          >
            <button
              className="absolute"
              onClick={() => handleDeleteImage(item)}
            >
              <FiTrash size={28} color="#fff" />
            </button>
            <img
              src={item.previewUrl}
              alt="Foto do carro"
              className="rounded-lg w-full h-32 object-cover"
            />
          </div>
        ))}
      </div>
      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2 ">
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <p className="mb-2 font-medium">nome do carro</p>
            <Input
              type="text"
              placeholder="EX: Gol G6"
              register={register}
              name="name"
              error={errors.name?.message}
            />
          </div>
          <div className="mb-3">
            <p className="mb-2 font-medium">Modelo do carro</p>
            <Input
              type="text"
              placeholder="EX: Flex 1.0"
              register={register}
              name="model"
              error={errors.model?.message}
            />
          </div>

          <div className="flex flex-row items-center w-full mb-3 gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Ano</p>
              <Input
                type="text"
                placeholder="EX: 2010/2011"
                register={register}
                name="year"
                error={errors.year?.message}
              />
            </div>
            <div className="w-full">
              <p className="mb-2 font-medium">Km rodados</p>
              <Input
                type="text"
                placeholder="EX: 100.000"
                register={register}
                name="km"
                error={errors.km?.message}
              />
            </div>
          </div>
          <div className="flex flex-row items-center w-full mb-3 gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Preço</p>
              <Input
                type="text"
                placeholder="EX: R$ 20.000,00"
                register={register}
                name="price"
                error={errors.price?.message}
              />
            </div>
            <div className="w-full">
              <p className="mb-2 font-medium">Cidade</p>
              <Input
                type="text"
                placeholder="EX: Curitiba"
                register={register}
                name="city"
                error={errors.city?.message}
              />
            </div>
          </div>
          <div className="mb-3">
            <p className="mb-2 font-medium">Telefone/WhatsApp</p>
            <Input
              type="text"
              placeholder="EX: 41999999999"
              register={register}
              name="whatsapp"
              error={errors.whatsapp?.message}
            />
          </div>
          <div className="mb-3">
            <p className="mb-2 font-medium">Descrição</p>
            <textarea
              className="border-2 w-full rounded-md h-24 px-2"
              placeholder="EX: Carro em ótimo estado, com ar condicionado, direção hidráulica, etc."
              {...register('description')}
              name="description"
              id="description"
            />
            {errors.description && (
              <span className="text-red-500 text-sm">
                {errors.description.message}
              </span>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-zinc-900 text-white py-2 rounded-md h-10 font-medium"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </Container>
  );
}
