import React, { useState, useEffect } from "react";

const SPOONACULAR_API_KEY = "48eee489876e48e5937f1d5662e4ce30";

export default function RecetasApp() {
  const [ingredientesEs, setIngredientesEs] = useState([]);
  const [ingredientesEn, setIngredientesEn] = useState([]);
  const [nuevoIngrediente, setNuevoIngrediente] = useState("");
  const [recetas, setRecetas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [sinResultados, setSinResultados] = useState(false);
  const [pagina, setPagina] = useState(0);
  const [hayMas, setHayMas] = useState(true);
  const [modoOscuro, setModoOscuro] = useState(false);

  const traducir = async (texto, from = "es", to = "en") => {
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=${from}|${to}`
      );
      const data = await res.json();
      return data.responseData.translatedText;
    } catch (err) {
      console.error("Error al traducir:", err);
      return texto;
    }
  };

  const agregarIngrediente = async () => {
    const esp = nuevoIngrediente.trim();
    if (esp && !ingredientesEs.includes(esp)) {
      const ingIngles = await traducir(esp, "es", "en");
      setIngredientesEs([...ingredientesEs, esp]);
      setIngredientesEn([...ingredientesEn, ingIngles.toLowerCase()]);
      setNuevoIngrediente("");
    }
  };

  const quitarIngrediente = (esp) => {
    const index = ingredientesEs.indexOf(esp);
    if (index !== -1) {
      const esCopy = [...ingredientesEs];
      const enCopy = [...ingredientesEn];
      esCopy.splice(index, 1);
      enCopy.splice(index, 1);
      setIngredientesEs(esCopy);
      setIngredientesEn(enCopy);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      agregarIngrediente();
    }
  };

  useEffect(() => {
    setRecetas([]);
    setPagina(0);
    setHayMas(true);
  }, [ingredientesEn]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
        document.documentElement.offsetHeight
      ) {
        if (!cargando && hayMas) {
          setPagina((prev) => prev + 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [cargando, hayMas]);

  useEffect(() => {
    if (ingredientesEn.length === 0) return;

    const fetchRecetas = async () => {
      setCargando(true);
      try {
        const query = ingredientesEn.join(",");
        const offset = pagina * 10;

        const res = await fetch(
          `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${query}&number=10&offset=${offset}&ranking=1&ignorePantry=true&apiKey=${SPOONACULAR_API_KEY}`
        );
        const data = await res.json();

        const filtradas = data.filter((receta) => {
          const usados = receta.usedIngredients.map((i) => i.name.toLowerCase());
          return ingredientesEn.every((ing) => usados.includes(ing));
        });

        const traducidas = await Promise.all(
          filtradas.map(async (receta) => {
            const tituloEs = await traducir(receta.title, "en", "es");
            return { ...receta, tituloTraducido: tituloEs };
          })
        );

        if (filtradas.length === 0) setHayMas(false);
        setRecetas((prev) => [...prev, ...traducidas]);
        setSinResultados(pagina === 0 && traducidas.length === 0);
      } catch (err) {
        console.error("Error al obtener recetas:", err);
        setSinResultados(true);
      } finally {
        setCargando(false);
      }
    };

    fetchRecetas();
  }, [pagina, ingredientesEn]);

  return (
    <div
      className={`min-h-screen px-6 py-14 transition-all duration-300 ease-in-out ${
        modoOscuro
          ? "bg-[#0f0f0f] text-white"
          : "bg-gradient-to-br from-[#fffef5] via-[#fdfaf0] to-[#f4f1e0] text-black"
      }`}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <header className="text-center mb-16 animate-fade-in relative max-w-7xl mx-auto">
        <h1 className={`text-6xl font-extrabold drop-shadow-lg tracking-tight ${modoOscuro ? "text-white" : "text-[#5D5C31]"}`}>
          Recetas
        </h1>
        <p className={`mt-4 text-xl max-w-2xl mx-auto ${modoOscuro ? "text-gray-300" : "text-gray-700"}`}>
          Encuentra inspiración culinaria con los ingredientes que tienes a mano.
        </p>
        <button
          onClick={() => setModoOscuro(!modoOscuro)}
          className="absolute top-0 right-0 mt-4 mr-4 px-4 py-2 rounded-full shadow-md text-sm font-medium transition hover:scale-105"
          style={{
            backgroundColor: modoOscuro ? "#f4f4f4" : "#333",
            color: modoOscuro ? "#333" : "#fff"
          }}
        >
          {modoOscuro ? "Modo claro ☀️" : "Modo oscuro 🌙"}
        </button>
      </header>

      <section className={`flex flex-col items-center justify-center gap-6 mb-16 ${ingredientesEs.length === 0 ? "mt-20" : ""}`}>
        {ingredientesEs.length === 0 && (
          <p className="text-lg text-[#8C2B32] font-medium animate-fade-in">
            Añade ingredientes para comenzar a descubrir recetas.
          </p>
        )}
        <div className="flex justify-center items-center gap-4 w-full max-w-2xl">
          <input
            type="text"
            placeholder="Añadir nuevo ingrediente"
            value={nuevoIngrediente}
            onChange={(e) => setNuevoIngrediente(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-6 py-4 border-2 border-[#5D5C31] rounded-full text-center text-lg bg-white text-gray-800 shadow-lg focus:outline-none focus:ring-4 focus:ring-[#5D5C31]/50 transition hover:scale-105"
          />
          <button
            onClick={agregarIngrediente}
            className="px-6 py-4 text-lg bg-[#5D5C31] text-white rounded-full hover:bg-[#6c6b3c] shadow-lg transition hover:scale-110"
          >
            Añadir
          </button>
        </div>
      </section>

      {ingredientesEs.length > 0 && (
        <section className={`rounded-3xl px-12 py-10 mb-20 shadow-xl transition-all max-w-5xl mx-auto animate-fade-in-up border ${
          modoOscuro
            ? "bg-white/10 border-white/10"
            : "bg-white/50 backdrop-blur-md border-[#5D5C31]"
        }`}>
          <h2 className="text-[#5D5C31] font-bold text-2xl mb-6">Ingredientes seleccionados:</h2>
          <div className="flex flex-wrap gap-3 mb-6">
            {ingredientesEs.map((item, index) => (
              <span
                key={index}
                onClick={() => quitarIngrediente(item)}
                className="bg-[#5D5C31] text-white px-4 py-2 rounded-full text-base font-medium shadow-md animate-bounce-slow hover:scale-105 transition-transform cursor-pointer"
                title="Haz clic para quitar"
              >
                {item}
              </span>
            ))}
          </div>
          <button
            onClick={() => {
              setIngredientesEs([]);
              setIngredientesEn([]);
              setRecetas([]);
              setPagina(0);
              setHayMas(true);
            }}
            className="bg-[#8C2B32] text-white px-6 py-3 rounded-full text-base font-semibold hover:brightness-110 shadow-lg transition hover:scale-105"
          >
            Quitar todos los ingredientes
          </button>
        </section>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 animate-fade-in-up max-w-7xl mx-auto">
        {recetas.map((receta) => {
            const recetaUrl = `https://spoonacular.com/recipes/${receta.title.replace(/ /g, "-").toLowerCase()}-${receta.id}`;
            return (
            <article
                key={receta.id}
                onClick={() => window.open(recetaUrl, "_blank")}
                className={`cursor-pointer relative rounded-3xl overflow-hidden shadow-xl border transition-all duration-300 group ${
                modoOscuro
                    ? "bg-white/10 border-white/10 hover:shadow-3xl"
                    : "bg-white/30 backdrop-blur-xl border-[#5D5C31]/30 hover:shadow-3xl"
                } hover:scale-[1.05] hover:-translate-y-1`}
            >
                <img
                src={receta.image}
                alt={receta.title}
                className="w-full h-48 object-cover rounded-t-3xl"
                />
                <div className="p-6 text-center">
                <h3 className={`text-2xl font-bold transition group-hover:underline ${modoOscuro ? "text-white" : "text-[#5D5C31]"}`}>
                    {receta.tituloTraducido}
                </h3>
                <a
                    href={recetaUrl}
                    className="inline-block mt-4 font-semibold text-lg text-[#8C2B32] transition-transform hover:-translate-y-[2px] hover:text-[#a0353d]"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                >
                    Ver receta
                </a>
                </div>
            </article>
            );
        })}
        </section>



      {cargando && (
        <p className="text-center text-2xl text-[#8C2B32] font-bold mt-10 animate-fade-in">
          Cargando recetas...
        </p>
      )}

      {!cargando && recetas.length > 0 && !hayMas && (
        <p className="text-center text-[#8C2B32] font-semibold text-lg mt-10">
          No hay más recetas con esos ingredientes.
        </p>
      )}

      {sinResultados && (
        <p className="text-center text-[#8C2B32] font-bold text-xl mt-10">
          No tenemos recetas con esos ingredientes, lo sentimos.
        </p>
      )}

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        @keyframes slide-in {
          from { transform: translateY(-30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 1s ease-out;
        }
      `}</style>
    </div>
  );
}
