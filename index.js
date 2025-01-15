const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
require('dotenv').config();

// Função para calcular a distância entre dois pontos usando a fórmula de Haversine
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

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Localização da UNCISAL
const UNCISAL_LOCATION = { lat: -9.673360, lon: -35.758585 };

bot.start((ctx) => {
  ctx.reply(
    'Olá, como posso te ajudar?',
    Markup.inlineKeyboard([
      Markup.button.callback('Ver restaurantes por perto', 'show_restaurants'),
      Markup.button.callback('Sair', 'exit'),
    ])
  );
});

bot.on('text',(ctx) => {
  ctx.reply(
    'Olá, como posso te ajudar?',
    Markup.inlineKeyboard([
      Markup.button.callback('Ver restaurantes por perto', 'show_restaurants'),
      Markup.button.callback('Sair', 'exit'),
    ])
  );
});

bot.action('show_restaurants', async (ctx) => {
  try {
    await ctx.reply('Buscando restaurantes próximos...');

    const response = await axios.get('https://api.geoapify.com/v2/places', {
      params: {
        categories: 'catering.restaurant',
        bias: `proximity:${UNCISAL_LOCATION.lon},${UNCISAL_LOCATION.lat}`,
        limit: 30,
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

bot.action('exit', (ctx) => ctx.reply('Até logo!'));

bot.launch();
console.log('Bot em execução...');