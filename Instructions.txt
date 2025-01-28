Sobre o Bot:
-- Este bot foi desenvolvido para fornecer informações sobre restaurantes próximos à UNCISAL (Universidade Estadual de Ciências da Saúde de Alagoas), utilizando a API Geoapify para buscar lugares próximos. 
-- O bot responde a interações com botões, permitindo que o usuário consulte os restaurantes mais próximos e suas avaliações.

Abaixo está a explicação de cada linha de código escrita para desenvolver o bot:

[ 
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
require('dotenv').config(); 
] 
-- Telegraf: É a biblioteca usada para criar bots no Telegram. O Telegraf facilita a interação com a API do Telegram e a manipulação de mensagens, botões e comandos. 
-- Markup: É uma funcionalidade do Telegraf que facilita a criação de botões e teclados interativos no Telegram.
-- axios: É uma biblioteca que facilita fazer requisições HTTP (como a que usamos para buscar os restaurantes na API do Geoapify).
-- require('dotenv').config(): Carrega as variáveis de ambiente do arquivo .env (como o token do bot e a chave da API do Geoapify).

[
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em quilômetros
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distância em quilômetros
}
] 
-- Esta função haversine calcula a distância entre dois pontos geográficos (latitude e longitude) usando a fórmula de Haversine, que é muito usada em cálculos de distâncias entre coordenadas geográficas. 
-- O resultado é a distância em quilômetros.

[
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
] 
-- Cria o bot usando o token fornecido pela variável de ambiente TELEGRAM_BOT_TOKEN (que está no arquivo .env).

[
const UNCISAL_LOCATION = { lat: -9.673360, lon: -35.758585 };
]
-- Define a localização da UNCISAL (Universidade Estadual de Ciências da Saúde de Alagoas) com as coordenadas de latitude e longitude.

[
bot.start((ctx) => {
  ctx.reply(
    'Olá, como posso te ajudar?',
    Markup.inlineKeyboard([
      Markup.button.callback('Ver restaurantes por perto', 'show_restaurants'),
      Markup.button.callback('Sair', 'exit'),
    ])
  );
});
]
-- bot.start: Este comando é acionado quando o usuário inicia uma conversa com o bot. O bot envia uma mensagem inicial com um texto de saudação ("Olá, como posso te ajudar?") e dois botões: "Ver restaurantes por perto" e "Sair".
-- Markup.inlineKeyboard: Cria os botões interativos que o usuário pode clicar.

[
bot.on('text', (ctx) => {
  ctx.reply(
    'Olá, como posso te ajudar?',
    Markup.inlineKeyboard([
      Markup.button.callback('Ver restaurantes por perto', 'show_restaurants'),
      Markup.button.callback('Sair', 'exit'),
    ])
  );
});
]
-- bot.on('text', ...): Este comando faz com que o bot responda a qualquer mensagem de texto enviada pelo usuário com a mesma saudação e os mesmos botões que aparecem no comando /start.

[
bot.action('show_restaurants', async (ctx) => {
  try {
    await ctx.reply('Buscando restaurantes próximos...');

    const response = await axios.get('https://api.geoapify.com/v2/places', {
      params: {
        categories: 'catering.restaurant',
        bias: `proximity:${UNCISAL_LOCATION.lon},${UNCISAL_LOCATION.lat}`,
        limit: 10,
        apiKey: process.env.GEOAPIFY_API_KEY,
      },
    });

    const places = response.data.features;

    if (places.length === 0) {
      ctx.reply('Não encontramos restaurantes próximos.');
      return;
    }

    // Ordenar os restaurantes pela proximidade, do mais próximo para o mais distante
    const sortedPlaces = places.map((place) => {
      const { lat, lon } = place.properties;
      const distance = haversine(UNCISAL_LOCATION.lat, UNCISAL_LOCATION.lon, lat, lon);
      return { place, distance };
    }).sort((a, b) => a.distance - b.distance); // Ordena pela distância (mais próximo primeiro)

    const results = sortedPlaces
    .filter((item) => item.place.properties.name) // Filtra restaurantes sem nome
    .map((item, index) => {
      const place = item.place;
      const name = place.properties.name || 'Sem nome';
      const address = place.properties.address_line1 || 'Endereço não disponível';
      const rating = place.properties.rating !== undefined 
        ? `${place.properties.rating} estrelas` 
        : 'Avaliação não disponível';
  
      const { lat, lon } = place.properties;
      const mapsLink = `https://www.google.com/maps?q=${lat},${lon}`;
  
      return `${index + 1}. ${name}\n📍 Localização: ${address}\n⭐ Nota: ${rating}\n🌐 [Abrir no Maps](${mapsLink})\n`;
    });

    // Envia a lista de restaurantes com o Markdown habilitado
    ctx.reply(results.join('\n\n'), { parse_mode: 'Markdown' });
  } catch (error) {
    console.error(error);
    ctx.reply('Ocorreu um erro ao buscar os restaurantes. Tente novamente mais tarde.');
  }
});
]
-- bot.action('show_restaurants', ...): Este comando é acionado quando o usuário clica no botão "Ver restaurantes por perto". O bot então envia a mensagem "Buscando restaurantes próximos...".
-- async: A função é assíncrona, pois estamos fazendo uma requisição HTTP para buscar os restaurantes, o que pode levar algum tempo.
-- categories: 'catering.restaurant': Filtra para mostrar apenas restaurantes.
-- bias: proximity:${UNCISAL_LOCATION.lon},${UNCISAL_LOCATION.lat}: Define que a busca será centrada nas coordenadas da UNCISAL.
-- limit: 10: Limita o número de resultados a 10.
-- apiKey: process.env.GEOAPIFY_API_KEY: Usa a chave da API do Geoapify que está no arquivo .env.
-- Extrai a lista de lugares (restaurantes) da resposta da API.
-- Verifica se não foram encontrados restaurantes próximos e envia uma mensagem informando isso ao usuário.
-- Para cada restaurante, calcula a distância até a UNCISAL usando a função haversine e ordena os restaurantes pela proximidade (do mais próximo para o mais distante).
-- Aqui, o bot mapeia cada restaurante para uma string formatada com o nome, endereço, avaliação e um link para abrir no Google Maps. Esses dados são coletados da resposta da API do Geoapify.
-- filter((item) => item.place.properties.name): A função filter é usada para excluir os restaurantes que não têm um nome. Se item.place.properties.name for undefined ou uma string vazia, o restaurante será excluído da lista.
-- Caso ocorra um erro durante a requisição ou processamento, o bot captura o erro e envia uma mensagem de erro ao usuário.
-- bot.action('exit', ...): Este comando é acionado quando o usuário clica no botão "Sair". O bot responde com "Até logo!".
-- bot.launch(): Inicia o bot, colocando-o em execução.
-- console.log('Bot em execução...'): Exibe uma mensagem no console para indicar que o bot está em funcionamento.

DIFERENÇA ENTRE A API GEOAPIFY_API_KEY E GOOGLE PLACES API:
-- Geoapify: A API do Geoapify oferece uma maneira simples e acessível de buscar locais próximos, como restaurantes, mas pode não ser tão precisa ou rica em dados quanto a API do Google. A Geoapify oferece uma boa cobertura, mas não tem a mesma base de dados ou a mesma qualidade de informações que o Google, especialmente no que diz respeito a detalhes como avaliações de usuários, horários de funcionamento, fotos e outros dados complementares.
-- Google Places API: A API do Google Places é amplamente reconhecida por sua qualidade e precisão. Ela tem uma base de dados muito maior e mais detalhada, com informações mais completas sobre os lugares, incluindo avaliações, fotos, horários de pico e muito mais. Além disso, a API do Google tem recursos avançados, como detecção de pontos de interesse mais próximos com base em mapas, oferecendo uma experiência de busca muito mais refinada. Isso significa que, se você usasse a API do Google, os resultados de restaurantes seriam mais precisos, com melhores avaliações, imagens e outros detalhes úteis.
-- Sim, se você usasse a API do Google, os resultados seriam consideravelmente melhores, com mais informações e mais precisão na busca.

DIFERENÇA ENTRE DO EASYINDEX PARA O INDEX: 
-- Funções de callback simples: O código agora usa funções tradicionais com function em vez de funções de flecha (=>).
-- Uso de for em vez de map e filter: No lugar de usar map para transformar os dados e filter para filtrar os restaurantes sem nome, utilizamos o for tradicional para iterar sobre os restaurantes e fazer as verificações necessárias.
-- Construção da lista de resultados: A lista de resultados é construída manualmente com uma string (results +=), o que é mais simples, mas menos eficiente do que usar map ou filter.
-- Verificação de nome: Se o restaurante não tiver nome, ele é ignorado com continue no loop for.