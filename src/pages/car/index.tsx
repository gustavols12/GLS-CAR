import { Container } from "../../components/container";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import { FaWhatsapp } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";

interface CarProps {
  id: string;
  name: string;
  model: string;
  city: string;
  year: string;
  km: string;
  description: string;
  created: string;
  price: string;
  owner: string;
  uid: string;
  whatsapp: string;
  images: CarImageProps[];
}
interface CarImageProps {
  name: string;
  uid: string;
  url: string;
}
export function CarDetail() {
  const { id } = useParams();
  const [car, setCar] = useState<CarProps>();
  const [sliderPerView, setSliderPerView] = useState<number>(2);
  const navigate = useNavigate();

  useEffect(() => {
    loadCar();
  }, [id]);

  // Função para carregar os dados do carro
  async function loadCar() {
    if (!id) {
      return;
    }
    const docRef = doc(db, "cars", id);
    getDoc(docRef).then((snapshot) => {
      if (!snapshot.data()) {
        navigate("/");
        return;
      }

      setCar({
        id: snapshot.id,
        name: snapshot.data()?.name,
        model: snapshot.data()?.model,
        city: snapshot.data()?.city,
        year: snapshot.data()?.year,
        km: snapshot.data()?.km,
        description: snapshot.data()?.description,
        created: snapshot.data()?.created,
        price: snapshot.data()?.price,
        owner: snapshot.data()?.owner,
        uid: snapshot.data()?.uid,
        whatsapp: snapshot.data()?.whatsapp,
        images: snapshot.data()?.images,
      });
    });
  }

  useEffect(() => {
    // Função para definir o número de slides visíveis no swiper
    function handleResize() {
      if (window.innerWidth < 640) {
        setSliderPerView(1);
      } else {
        setSliderPerView(2);
      }
    }

    // Adiciona o listener de resize
    window.addEventListener("resize", handleResize);
    // Chama a função uma vez para definir o valor inicial
    handleResize();

    // Limpa o listener ao desmontar o componente
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Container>
      {car && (
        <Swiper
          slidesPerView={sliderPerView}
          pagination={{ clickable: true }}
          navigation
        >
          {car?.images.map((image) => (
            <SwiperSlide key={image.name}>
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-96 object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      {car && (
        <main className="w-full bg-white rounded-lg p-6 my-4">
          <div className="flex flex-col sm:flex-row mb-4 items-center justify-between">
            <h2 className="font-bold text-3xl text-black">{car?.name}</h2>
            <h2 className="font-bold text-3xl text-black">R$ {car?.price}</h2>
          </div>
          <p>{car?.model}</p>
          <div className="flex w-full gap-6 my-4">
            <div className="flex flex-col gap-4">
              <div>
                <p>Cidade</p>
                <strong>{car?.city}</strong>
              </div>
              <div>
                <p>Ano</p>
                <strong>{car?.year}</strong>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <p>KM</p>
                <strong>{car?.km}</strong>
              </div>
            </div>
          </div>
          <strong>Descrição:</strong>
          <p className="text-gray-600 mb-4">{car?.description}</p>

          <strong>Telefone | WhatsApp</strong>
          <p className="text-gray-600 mb-4">{car?.whatsapp}</p>
          <a
            href={`https://api.whatsapp.com/send?phone=${car?.whatsapp}&text=Olá, estou interessado no carro ${car?.name}`}
            target="_blank"
            className="text-white w-full cursor-pointer bg-green-500 flex items-center justify-center gap-2 my-6 h-11 text-xl rounded-lg font-medium"
          >
            Conversar com vendedor
            <FaWhatsapp size={26} color="#fff" />
          </a>
        </main>
      )}
    </Container>
  );
}
