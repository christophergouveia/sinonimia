import { useMemo } from "react";

interface GridCellProps {
  index: number;
  handleMouseDown: (index: number) => void;
  handleMouseEnter: (index: number) => void;
  handleMouseUp: () => void;
  selecao: number[];
  letra: string;
  palavrasCerta: number[][];
  palavrasErrada: number[];
}

export default function GridCell({
  index,
  handleMouseDown,
  handleMouseEnter,
  handleMouseUp,
  selecao,
  letra,
  palavrasCerta,
  palavrasErrada,
}: GridCellProps) {
  const isPalavraCerta = useMemo(() => {
    return palavrasCerta.some((palavra) => palavra.includes(index));
  }, [index, palavrasCerta]);

  return (
    <span
      className={[
        "min-w-fit p-2 lg:px-0 lg:max-w-10 lg:py-[2px] rounded-md text-center transition-colors duration-200 touch-none",
        selecao.includes(index) ? "bg-sky-800" : "hover:bg-gray-200",
        isPalavraCerta ? "!bg-green-500" : "",
        palavrasErrada.includes(index) ? "!bg-red-500" : "",
      ].join(" ")}
      key={index}
      onMouseDown={() => handleMouseDown(index)}
      onMouseEnter={() => handleMouseEnter(index)}
      onMouseUp={() => handleMouseUp()}
      data-index={index}
    >
      {letra}
    </span>
  );
}
