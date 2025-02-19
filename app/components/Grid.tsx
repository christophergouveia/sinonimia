import { useCallback, useEffect, useState, useRef } from "react";
import GridCell from "./GridCell";
import Image from "next/image";
import { removerAcentos } from "../utils/wordManipulation";
import Confetti from "react-dom-confetti";

type Direcao = "horizontal" | "vertical" | "diagonal" | "diagonal_contrario";

interface GridProps {
  setIsJogando: (value: boolean) => void;
  setPalavra: (value: string) => void;
  isJogando: boolean;
  palavra: string;
  sinonimos: string[];
}

const confettiConfig = {
  angle: 90,
  spread: 360,
  startVelocity: 40,
  elementCount: 70,
  dragFriction: 0.12,
  duration: 3000,
  stagger: 3,
  width: "10px",
  height: "10px",
  perspective: "500px",
  colors: ["#f00", "#0f0", "#00f"],
};

const TAMANHO_GRID = 16;

export default function Grid({ setIsJogando, isJogando, palavra, sinonimos, setPalavra }: GridProps) {
  const palavras =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ";
  const [gridState, setGridState] = useState({
    palavrasGrid: Array.from(
      { length: TAMANHO_GRID * TAMANHO_GRID },
      () => "."
    ),
    palavras: [] as string[],
    palavrasCertas: [] as number[][],
    palavrasCertasString: [] as string[],
  });
  const [selecao, setSelecao] = useState<number[]>([]);
  const [direcaoSelecao, setDirecaoSelecao] = useState<Direcao | null>(null);
  const [insercaoCompleta, setInsercaoCompleta] = useState(false);
  const [palavrasErrada, setPalavrasErrada] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [zerou, setZerou] = useState<boolean>(false);
  const palavrasAleatoriasRef = useRef(sinonimos);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (
      gridState.palavrasCertasString.length != 0 &&
      gridState.palavrasCertasString.length ==
        palavrasAleatoriasRef.current.length
    ) {
      setModalOpen(true);
      setTimeout(() => {
        setConfetti(true);
      }, 200);
      setZerou(true);
      document.body.style.overflow = "hidden";
      document.body.scrollTo(0, 0);
    } else {
      setModalOpen(false);
      setZerou(false);
      setTimeout(() => {
        setConfetti(false);
      }, 200);
    }
  }, [gridState.palavrasCertasString]);

  useEffect(() => {
    if (insercaoCompleta) {
      setGridState((palavrasGridAtual) => {
        const novaGrid = gridState.palavrasGrid.map((a) =>
          a === "." ? palavras[Math.floor(Math.random() * palavras.length)] : a
        );
        return { ...palavrasGridAtual, palavrasGrid: novaGrid };
      });
    }
  }, [insercaoCompleta]);

  useEffect(() => {
    if (sinonimos != palavrasAleatoriasRef.current) {
      palavrasAleatoriasRef.current = sinonimos;
    }
  }, [sinonimos]);

  const inserirPalavra = useCallback(
    (palavra: string, grid: string[]): string[] => {
      const direcoes: Direcao[] = [
        "horizontal",
        "vertical",
        "diagonal",
        "diagonal_contrario",
      ];
      let tentativas = 0;
      const maxTentativas = 1000;

      while (tentativas < maxTentativas) {
        const direcaoAleatoria =
          direcoes[Math.floor(Math.random() * direcoes.length)];
        const linhaAleatoria = Math.floor(Math.random() * TAMANHO_GRID);
        const colunaAleatoria = Math.floor(Math.random() * TAMANHO_GRID);

        let podeInserir = true;
        for (let i = 0; i < palavra.length; i++) {
          let novaLinha = linhaAleatoria;
          let novaColuna = colunaAleatoria;

          switch (direcaoAleatoria) {
            case "horizontal":
              novaColuna += i;
              break;
            case "vertical":
              novaLinha += i;
              break;
            case "diagonal":
              novaLinha += i;
              novaColuna += i;
              break;
            case "diagonal_contrario":
              novaLinha += i;
              novaColuna -= i;
              break;
          }

          const indice = novaLinha * TAMANHO_GRID + novaColuna;

          if (
            novaLinha < 0 ||
            novaLinha >= TAMANHO_GRID ||
            novaColuna < 0 ||
            novaColuna >= TAMANHO_GRID ||
            grid[indice] !== "."
          ) {
            podeInserir = false;
            break;
          }
        }

        if (podeInserir) {
          for (let i = 0; i < palavra.length; i++) {
            let novaLinha = linhaAleatoria;
            let novaColuna = colunaAleatoria;

            switch (direcaoAleatoria) {
              case "horizontal":
                novaColuna += i;
                break;
              case "vertical":
                novaLinha += i;
                break;
              case "diagonal":
                novaLinha += i;
                novaColuna += i;
                break;
              case "diagonal_contrario":
                novaLinha += i;
                novaColuna -= i;
                break;
            }

            const indice = novaLinha * TAMANHO_GRID + novaColuna;
            grid[indice] = palavra[i].toUpperCase();
          }
          setGridState((prevState) => ({
            ...prevState,
            palavras: [...prevState.palavras, palavra],
          }));
          return grid;
        }
        tentativas++;
      }
      return grid;
    },
    []
  );

  useEffect(() => {
    if (isJogando) {
      const handleInsercao = async () => {
        let newGrid = [...gridState.palavrasGrid];

        for (const palavra of palavrasAleatoriasRef.current) {
          newGrid = inserirPalavra(palavra, newGrid);
        }

        setGridState((prevGridState) => ({
          ...prevGridState,
          palavrasGrid: newGrid,
        }));

        setInsercaoCompleta(true);
      };

      handleInsercao();
    } else {
      setGridState({
        palavrasGrid: Array.from(
          { length: TAMANHO_GRID * TAMANHO_GRID },
          () => "."
        ),
        palavras: [],
        palavrasCertas: [],
        palavrasCertasString: [],
      });
      palavrasAleatoriasRef.current = [];
      setInsercaoCompleta(false);
      setPalavrasErrada([]);
      setSelecao([]);
      setModalOpen(false);
      setDirecaoSelecao(null);
    }
  }, [isJogando, inserirPalavra]);

  const handleMouseDown = (index: number) => {
    setSelecao([index]);
    setDirecaoSelecao(null);
  };

  const handleMouseEnter = (index: number) => {
    if (selecao.length === 0) {
      return;
    }

    if (selecao.includes(index)) {
      return;
    }

    const ultimoIndex = selecao[selecao.length - 1];
    const linhaUltimo = Math.floor(ultimoIndex / TAMANHO_GRID);
    const colunaUltimo = ultimoIndex % TAMANHO_GRID;
    const linhaAtual = Math.floor(index / TAMANHO_GRID);
    const colunaAtual = index % TAMANHO_GRID;

    const diferencaLinha = linhaAtual - linhaUltimo;
    const diferencaColuna = colunaAtual - colunaUltimo;

    let novaDirecao: Direcao | null = null;

    if (
      direcaoSelecao === null ||
      (Math.abs(diferencaLinha) === 1 && Math.abs(diferencaColuna) === 1) ||
      (diferencaLinha === 0 && Math.abs(diferencaColuna) === 1) ||
      (Math.abs(diferencaLinha) === 1 && diferencaColuna === 0)
    ) {
      if (diferencaLinha === 1 && diferencaColuna === 0) {
        novaDirecao = "vertical";
      } else if (diferencaLinha === -1 && diferencaColuna === 0) {
        novaDirecao = "vertical";
      } else if (diferencaLinha === 0 && diferencaColuna === 1) {
        novaDirecao = "horizontal";
      } else if (diferencaLinha === 0 && diferencaColuna === -1) {
        novaDirecao = "horizontal";
      } else if (diferencaLinha === 1 && diferencaColuna === 1) {
        novaDirecao = "diagonal";
      } else if (diferencaLinha === -1 && diferencaColuna === -1) {
        novaDirecao = "diagonal";
      } else if (diferencaLinha === 1 && diferencaColuna === -1) {
        novaDirecao = "diagonal_contrario";
      } else if (diferencaLinha === -1 && diferencaColuna === 1) {
        novaDirecao = "diagonal_contrario";
      }
    }

    if (
      novaDirecao &&
      (direcaoSelecao === null || novaDirecao === direcaoSelecao)
    ) {
      setSelecao((prevState) => [...prevState, index]);
      setDirecaoSelecao(novaDirecao);
    }
  };

  const handleMouseUp = () => {
    const palavra = selecao
      .map((a) => gridState.palavrasGrid[a])
      .join("")
      .toLowerCase();
    if (
      palavrasAleatoriasRef.current
        .map((a) => a.toLowerCase())
        .includes(palavra)
    ) {
      setGridState({
        ...gridState,
        palavrasCertas: [...gridState.palavrasCertas, selecao],
        palavrasCertasString: [...gridState.palavrasCertasString, palavra],
      });
    } else {
      setPalavrasErrada(selecao);
    }
    setSelecao([]);
    setDirecaoSelecao(null);
  };

  useEffect(() => {
    if (palavrasErrada.length > 0) {
      setTimeout(() => {
        setPalavrasErrada([]);
      }, 500);
    }
  }, [palavrasErrada]);

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selecao.length > 0) {
      handleMouseUp();
    }
  };

  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    handleMouseDown(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target instanceof HTMLElement) {
      const index = parseInt(target.dataset.index || "-1", 10);
      if (index >= 0) {
        handleMouseEnter(index);
      }
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const jogarNovamente = () => {
    setInsercaoCompleta(false);
    setIsJogando(false);
    setModalOpen(false);
    setZerou(false);
    setConfetti(false);
    setSelecao([]);
    setDirecaoSelecao(null);
    setPalavrasErrada([]);
    setPalavra("")
    setGridState({
      palavrasGrid: Array.from(
        { length: TAMANHO_GRID * TAMANHO_GRID },
        () => "."
      ),
      palavras: [],
      palavrasCertas: [],
      palavrasCertasString: [],
    });
    document.body.style.overflow = "auto";
  }

  return (
    <>
      {isJogando && (
        <>
        {zerou && (
          <button
          onClick={jogarNovamente}
            className="bg-green-500 block mx-auto p-4 px-8 rounded-3xl border-b-4 border-green-900 text-2xl font-bold text-green-800 transition-all hover:scale-105 active:scale-100 active:brightness-90 "
          >
            JOGAR NOVAMENTE
          </button>
        )}
          <h1 className="text-center text-xl">
            {selecao.length == 0 ? (
              <>&nbsp;</>
            ) : (
              selecao
                .map((elemento) => gridState.palavrasGrid[elemento])
                .join("")
            )}
          </h1>
          <div
            className={`border border-neutral-100 shadow-lg rounded-md mx-auto grid gap-1 w-full lg:w-[calc(75%-5rem)] text-[10px] lg:text-xl lg:gap-2 grid-rows-[repeat(16,_1fr)] grid-cols-[repeat(16,_minmax(0,_1fr))] select-none`}
            tabIndex={0}
            onMouseLeave={(e) => handleMouseLeave(e)}
            onMouseUp={handleMouseUp}
            onTouchStart={(e) =>
              handleTouchStart(
                parseInt((e.target as HTMLElement).dataset.index || "0"),
                e
              )
            }
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {gridState.palavrasGrid.map((valor, index) => (
              <GridCell
                key={index}
                index={index}
                handleMouseUp={handleMouseUp}
                handleMouseDown={() => handleMouseDown(index)}
                handleMouseEnter={() => handleMouseEnter(index)}
                selecao={selecao}
                letra={valor}
                palavrasCerta={gridState.palavrasCertas}
                palavrasErrada={palavrasErrada}
                data-index={index}
              />
            ))}
          </div>
          <div className="flex flex-col items-center justify-center my-8">
            <div
              className={`lg:grid ${
                palavrasAleatoriasRef.current.length >= 4
                  ? "lg:grid-cols-[repeat(4,min-content)]"
                  : "lg:grid-cols-[repeat(3,min-content)]"
              } lg:grid-rows-4 mx-auto gap-4 flex flex-row flex-wrap items-center justify-center`}
            >
              {palavrasAleatoriasRef.current.map((palavra, index) => (
                <div
                  key={index}
                  className={`p-4 transition-colors shadow-lg rounded-lg bg-blue-100 text-center ${
                    gridState.palavrasCertasString.includes(
                      palavra.toLowerCase()
                    )
                      ? "!bg-green-500"
                      : ""
                  }`}
                >
                  {palavra}
                </div>
              ))}
            </div>
          </div>

          {modalOpen && (
            <div className="fixed top-1/2 left-1/2 bg-black/10 h-full w-full flex flex-col justify-center items-center transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative p-8 rounded-xl w-[90%] max-w-[720px] shadow-2xl bg-white text-center scale-100 2xl:scale-100 sm:scale-75">
                <span
                  onClick={() => {
                    setModalOpen(false);
                    document.body.style.overflow = "auto";
                  }}
                  className="absolute right-2 top-2 text-2xl sm:text-lg cursor-pointer font-extrabold text-red-500"
                >
                  X
                </span>
                <h1 className="bg-gradient-to-r from-green-800 to-green-400 bg-clip-text text-transparent text-4xl md:text-6xl font-bold m-2">
                  Parabéns!
                </h1>
                <h2 className="text-lg md:text-xl">
                  Você concluiu o caça-palavras dos sinônimos da palavra:
                  <span className="text-green-700 font-bold"> {palavra} </span>
                </h2>

                <Image
                  alt={`${palavra}`}
                  src={`https://s.dicio.com.br/${removerAcentos(palavra)}.jpg`}
                  width={500}
                  height={300}
                  className="mx-auto rounded-lg m-4"
                />
                <h2>
                  Caso esteja sentindo falta de algum sinônimo, não se preocupe!
                  Não é possível listar todos aqui por causa que nossos dados
                  puxados do site do{" "}
                  <a
                    href="https://www.dicio.com.br/"
                    className="text-blue-500 underline"
                  >
                    Dicio
                  </a>{" "}
                  são limitados. Mas você pode acessar a palavra diretamente do
                  dicionário de lá 😉
                </h2>
                <button className="rounded hover:scale-105 mt-2 transition-all">
                  <a
                    href={"https://www.dicio.com.br/" + removerAcentos(palavra)}
                    target="_blank"
                    className="bg-[#E8A938] p-2 rounded"
                  >
                    Acessar palavra
                  </a>
                </button>
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Confetti config={confettiConfig} active={confetti} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
