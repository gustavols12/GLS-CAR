import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/painelHeader";
import { FiTrash2 } from "react-icons/fi";
import { db, storage } from "../../services/firebaseConnection";
import { useContext, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  where,
  query,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { AuthContext } from "../../context/authContext";

interface CarProps {
  id: string;
  name: string;
  year: string;
  uid: string;
  price: string;
  city: string;
  km: string;
  images: CarImageProps[];
}
interface CarImageProps {
  name: string;
  uid: string;
  url: string;
}

export function Dashboard() {
  const [cars, setCars] = useState<CarProps[]>([]);
  const { user } = useContext(AuthContext);
  const [loadImage, setLoadImage] = useState<string[]>([]);

  useEffect(() => {
    function loadCars() {
      if (!user?.uid) {
        return;
      }

      const carRef = collection(db, "cars");
      const queryRef = query(carRef, where("uid", "==", user.uid));

      getDocs(queryRef)
        .then((snapshot) => {
          let listCars = [] as CarProps[];
          snapshot.forEach((doc) => {
            listCars.push({
              id: doc.id,
              name: doc.data().name,
              year: doc.data().year,
              km: doc.data().km,
              price: doc.data().price,
              city: doc.data().city,
              images: doc.data().images,
              uid: doc.data().uid,
            });
          });
          setCars(listCars);
        })
        .catch((error) => {
          console.error("Erro ao carregar carros:", error);
        });
    }
    loadCars();
  }, [user]);

  async function handleDelete(car: CarProps) {
    const itemCar = car;

    const docRef = doc(db, "cars", car.id);
    await deleteDoc(docRef);

    itemCar.images.map(async (image) => {
      const imagePath = `images/${car.uid}/${image.name}`;
      const imageRef = ref(storage, imagePath);

      try {
        await deleteObject(imageRef);
        setCars(cars.filter((car) => car.id !== itemCar.id));
      } catch (error) {
        console.error("Erro ao excluir imagem:", error);
      }
    });
  }

  function handleImageLoad(id: string) {
    setLoadImage((prev) => [...prev, id]);
  }

  return (
    <Container>
      <DashboardHeader />
      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <section className="w-full bg-white rounded-lg relative" key={car.id}>
            <button
              className="absolute  bg-white w-14 h-14 rounded-full flex items-center justify-center right-2 top-2 shadow-md"
              onClick={() => handleDelete(car)}
            >
              <FiTrash2 size={26} color="#000" />
            </button>
            <div
              className="w-full h-72 rounded-lg bg-slate-200"
              style={{
                display: loadImage.includes(car.id) ? "none" : "block",
              }}
            ></div>
            <img
              src={car.images[0]?.url}
              alt="Imagem do carro"
              className="w-full rounded-lg mb-2 max-h-70"
              onLoad={() => handleImageLoad(car.id)}
              style={{
                display: loadImage.includes(car.id) ? "block" : "none",
              }}
            />
            <p className="font-bold mt-1 px-2 mb-2">{car.name}</p>
            <div className="flex flex-col px-2">
              <span className="text-zinc-700 mb-6">
                {car.year} | {car.km} km
              </span>
              <strong className="text-black font-bold mt-4">{car.price}</strong>
              <div className="w-full h-px bg-slate-200 my-2"></div>
              <div className="px-2 pb-2">
                <span className="text-black ">{car.city}</span>
              </div>
            </div>
          </section>
        ))}
      </main>
    </Container>
  );
}
