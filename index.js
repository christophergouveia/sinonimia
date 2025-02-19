const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const removerAcentos = require("app/utils/wordManipulation.js");

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";

let browser;

async function getBrowserInstance() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
    });
  }
  return browser;
}

async function getSynonyms(word) {
  word = removerAcentos(word);
  word = word.replace(" ", "-");
  try {
    const url = `https://www.dicio.com.br/${word}`;
    const response = await axios.get(url, {
      headers: { "User-Agent": USER_AGENT },
    });
    const $ = cheerio.load(response.data);

    const synonyms = [];
    $(".sinonimos").each((_, children) => {
      if ($(children).text().includes("é sinônimo de:")) {
        $("a", children).each((i, element) => {
          synonyms.push($(element).text().trim());
        });
      }
    });

    return synonyms;
  } catch (error) {
    console.error(`Erro ao buscar sinônimos para ${word}:`, error);
    return [];
  }
}

async function getRandomWord() {
  const browser = await getBrowserInstance();
  const page = await browser.newPage();
  await page.goto("https://dicio.com.br");
  await page.click("#js-btn-sortear");
  await new Promise((resolve) => setTimeout(resolve, 730));
  const palavra = await page.evaluate(
    () => document.getElementById("js-pl-aleatoria").textContent
  );
  await page.close();
  return palavra;
}

(async () => {

  let temsinonimo = false;
  let synonyms;
  let palavra;
  while (!temsinonimo) {
    palavra = await getRandomWord();
    synonyms = await getSynonyms(palavra);
    if (synonyms.length > 2) {
      temsinonimo = true;
      break;
    }
  }
  console.log(`Palavra aleatória: ${palavra}`);
  console.log(`Sinônimos de ${palavra}: ${synonyms.join(", ")}`);
  process.exit();
})();

