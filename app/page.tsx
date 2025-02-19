"use client";

import { useEffect, useRef, useState } from "react";
import Grid from "./components/Grid";
import { Comic_Neue } from "next/font/google";
const Comic = Comic_Neue({ subsets: ["latin"], weight: "400" });

export default function Home() {
  const [isJogando, setIsJogando] = useState<boolean>(false);
  const [palavra, setPalavra] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [sinonimosGrid, setSinonimosGrid] = useState<string[]>([]);
  const sinonimosRef = useRef<string[]>([]);
  const [error, setError] = useState({
    error: false,
    message: "",
  });
  const inputRef = useRef(null);

  useEffect(() => {
    sinonimosRef.current = sinonimosGrid;
  }, [sinonimosGrid]);

  const sortearPalavra = async () => {
    setLoading(true);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dicio/randomword`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((palavra) => {
        setPalavra(palavra.palavra);
        setLoading(false);
      });
  };

  const handleJogar = async () => {
    setIsJogando(false);
    setError({ error: false, message: "" });
    console.log(palavra.trim().length);
    if (palavra.trim().length == 0) {
      setError({
        error: true,
        message: "Insira uma palavra para jogar e clique em 'Jogar' novamente.",
      });
      return;
    }
    if (palavra.trim().length < 4) {
      setError({
        error: true,
        message: "Insira uma palavra com, no minimo, 4 caracteres/letras.",
      });
      return;
    }
    setLoading(true);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dicio/sinonimos/` + palavra)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          setError({
            error: true,
            message: "Essa palavra não tem sinônimos suficiente ou não existe.",
          });
        }
      })
      .then(async (sinonimos) => {
        if (!sinonimos) {
          setLoading(false);
          return;
        }
        setLoading(false);
        setIsJogando(false);
        setSinonimosGrid([]);
        for (let i = 0; i < 5; i++) {
          const aleatorio =
            sinonimos.sinonimos[
              Math.floor(Math.random() * sinonimos.sinonimos.length)
            ];
          if (sinonimosRef.current.includes(aleatorio)) {
            continue;
          }
          setSinonimosGrid((prevState) => {
            if (prevState.includes(aleatorio)) {
              return [...prevState];
            }
            return [...prevState, aleatorio];
          });
        }
        setIsJogando(true);
        setLoading(false);
      });
  };
  return (
    <>
      <div className="flex w-full items-center justify-center flex-col gap-2 my-6">
        <h1 className={`text-6xl text-center font-medium ${Comic.className}`}>
          SINONIMÍA
        </h1>
        <p className="text-center text-xl text-gray-600">
          Melhore sua escrita em redação utilizando sinônimos! Uma forma mais
          divertida de aprender é com caça-palavras!
        </p>
        {!isJogando && (
          <>
            <form
              className="flex flex-wrap items-center justify-center gap-4 p-2 "
              onSubmit={(e) => {
                e.preventDefault();
                handleJogar();
              }}
            >
              <div className="flex flex-col gap-2">
                <input
                  ref={inputRef}
                  disabled={loading}
                  type="text"
                  placeholder="Palavra"
                  value={palavra}
                  onChange={(e) => setPalavra(e.target.value)}
                  className="p-4 px-8 rounded-3xl border-b-4 border-green-400 outline-none"
                />
                {error.error && (
                  <p className="text-red-500 text-center">{error.message}</p>
                )}
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={sortearPalavra}
                className="h-fit bg-green-200 p-4 rounded-2xl"
              >
                Sortear palavra
              </button>
            </form>
            <button
              disabled={loading}
              onClick={handleJogar}
              className="bg-green-500 p-4 px-8 rounded-3xl border-b-4 border-green-900 text-2xl font-bold text-green-800 transition-all hover:scale-105 active:scale-100 active:brightness-90 "
            >
              JOGAR
            </button>
          </>
        )}
      </div>
      <Grid
        setIsJogando={setIsJogando}
        isJogando={isJogando}
        palavra={palavra}
        sinonimos={sinonimosGrid}
        setPalavra={setPalavra}
      />
      <footer className="text-center">Desenvolvido com muito ☕ e ❤️ por Christopher e Kaike</footer>
    </>
  );
}
