import { Container } from "../../components/container";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import { Link } from "react-router-dom";

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

export function Home() {
  const [cars, setCars] = useState<CarProps[]>([]);
  const [loadImage, setLoadImage] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    loadCars();
  }, []);

  function loadCars() {
    const carRef = collection(db, "cars");
    const queryRef = query(carRef, orderBy("created", "desc"));

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

  function handleImageLoad(id: string) {
    setLoadImage((prev) => [...prev, id]);
  }

  async function handleSearchCar() {
    if (input === "") {
      loadCars();
      return;
    }
    setCars([]);
    setLoadImage([]);

    const q = query(
      collection(db, "cars"),
      where("name", ">=", input.toUpperCase()),
      where("name", "<=", input.toUpperCase() + "\uf8ff")
    );

    const querySnapshot = await getDocs(q);

    let listCars = [] as CarProps[];
    querySnapshot.forEach((doc) => {
      listCars.push({
        id: doc.id,
        name: doc.data()?.name,
        year: doc.data()?.year,
        km: doc.data()?.km,
        price: doc.data()?.price,
        city: doc.data()?.city,
        images: doc.data()?.images,
        uid: doc.data()?.uid,
      });
    });
    if (querySnapshot.empty) {
      loadCars();
      return;
    }
    setCars(listCars);
    setInput("");
  }

  return (
    <Container>
      <section className="w-full max-w-3xl mx-auto p-4 flex items-center justify-center gap-2 bg-white rounded">
        <input
          className="w-full outline-none rounded-lg h-9 px-3 border-2"
          placeholder="Digite o nome do carro"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="bg-red-500 text-white h-9 px-8 rounded-lg font-medium"
          onClick={() => handleSearchCar()}
        >
          Buscar
        </button>
      </section>
      <h1 className="font-bold text-2xl mt-6 mb-4 text-center">
        Carros novos e usados em todo o Brasil
      </h1>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <Link to={`/car/${car.id}`} key={car.id}>
            <section className="w-full rounded-lg bg-white text-start">
              <div
                className="w-full h-72 rounded-lg bg-slate-200"
                style={{
                  display: loadImage.includes(car.id) ? "none" : "block",
                }}
              ></div>
              <img
                className="w-full rounded-lg mb-2 max-h-72 hover:scale-105 transition-all"
                src={car.images[0].url}
                alt="Imagem do carro"
                onLoad={() => handleImageLoad(car.id)}
                style={{
                  display: loadImage.includes(car.id) ? "block" : "none",
                }}
              />
              <p className="font-bold mt-1 mb-2 px-2">{car.name}</p>

              <div className="flex flex-col px-2">
                <span className="text-zinc-700 mb-6">
                  {car.year} | {car.km} km
                </span>
                <strong className="font-bold text-xl">R${car.price}</strong>
              </div>

              <div className="w-full h-px bg-slate-200 my-2"></div>

              <div className="px-2 pb-2">
                <span className="text-black">{car.city}</span>
              </div>
            </section>
          </Link>
        ))}
      </main>
    </Container>
  );
}
