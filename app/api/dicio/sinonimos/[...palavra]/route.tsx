import axios from "axios";
import cheerio from "cheerio";
import { removerAcentos } from "@/app/utils/wordManipulation";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";

const axiosClient = axios.create({
  baseURL: 'https://dicio.com.br',
});

export async function GET(
  request: Request,
  { params }: { params: { palavra: string } }
) {
  try {
    params.palavra = params.palavra[0];
    const synonymsResult = await getSynonyms(params.palavra);

    console.log(synonymsResult);
    

    if (synonymsResult === false) {
      return Response.json("Essa palavra não existe.", {
        status: 404,
      });
    }

    const synonyms = synonymsResult;
    if (synonyms.length < 2) {
      return Response.json("Essa palavra não tem sinônimos suficiente", {
        status: 500,
      });
    }

    return Response.json(
      { palavra: params.palavra, sinonimos: synonyms },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Erro na API:", error);
    return Response.json({
      error: error.message || "Erro interno no servidor",
    });
  }
}

async function getSynonyms(word: string): Promise<string[] | false> {
  word = removerAcentos(word);
  word = word.replace(" ", "-");

  try {
    const url = `https://www.dicio.com.br/${word}`;
    try {
      await axiosClient.get(url);
    } catch (e) {
      return false;
    }
    const response = await axios.get(url, {
      headers: { "User-Agent": USER_AGENT },
    });
    const $ = cheerio.load(response.data);

    const synonyms: string[] = [];
    $(".sinonimos").each((_, children) => {
      if ($(children).text().includes("é sinônimo de:")) {
        $("a", children).each((i, element) => {
          const sinonimo = $(element).text().trim();
          if (!(sinonimo.split(" ").length >= 2)) {
            synonyms.push($(element).text().trim());
          }
        });
      }
    });

    return synonyms;
  } catch (error) {
    console.error(`Erro ao buscar sinônimos para ${word}:`, error);
    return false;
  }
}
