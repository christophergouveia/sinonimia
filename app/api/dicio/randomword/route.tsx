const palavrasUteis = [
  "pois",
  "como",
  "logo",
  "pois",
  "assim",
  "além",
  "ainda",
  "também",
  "então",
  "depois",
  "antes",
  "enfim",
  "porém",
  "embora",
  "seja",
  "caso",
  "desde",
  "quando",
  "onde",
  "quanto",
  "qual",
  "quem",
  "tanto",
  "todavia",
  "contudo",
  "entretanto",
  "portanto",
  "porque",
  "ademais",
  "apesar", 
  "embora", 
  "então", 
  "enquanto", 
  "portanto", 
  "todavia", 
  "contudo", 
  "entretanto", 
  "além", 
  "ainda"
];

export const revalidate = 0;


export async function GET(req: Request) {
  let word = palavrasUteis[Math.floor(Math.random() * palavrasUteis.length)];
  const response = new Response(JSON.stringify({ palavra: word }))
  return response;
}