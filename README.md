# Uncisal Restaurantes Bot

## 📌 About
Uncisal Restaurantes Bot is a Telegram bot designed to provide information about restaurants near UNCISAL (Universidade Estadual de Ciências da Saúde de Alagoas). The bot uses the Geoapify API to search for nearby places and responds to user interactions with buttons, allowing users to query the closest restaurants and their ratings.

## 🌟 Features
- Search for restaurants near UNCISAL
- Display restaurant information including name, address, and rating
- Provide Google Maps links for each restaurant
- Interactive button interface for easy navigation

## 🛠 Technologies Used
- Node.js
- Telegraf (Telegram Bot API framework)
- Axios (for HTTP requests)
- Geoapify API (for location-based searches)
- dotenv (for environment variable management)

## 🚀 Setup and Installation
1. Clone this repository
2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
3. Create a \`.env\` file in the root directory with the following variables:
   \`\`\`
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   GEOAPIFY_API_KEY=your_geoapify_api_key
   \`\`\`
4. Run the bot:
   \`\`\`
   node index.js
   \`\`\`

## 📖 Usage
1. Start a chat with the bot on Telegram
2. Use the "/start" command or send any text message to get the main menu
3. Click on "Ver restaurantes por perto" to see nearby restaurants
4. The bot will display a list of up to 10 nearby restaurants with their names, addresses, ratings, and Google Maps links

## 🗺 API Information
This bot uses the Geoapify API for location-based searches. While it provides good coverage, it may not be as comprehensive as other APIs like Google Places. The results include basic information about restaurants such as name, address, and rating.

## 📁 Project Structure
- \`index.js\`: Main bot logic and command handlers
- \`haversine.js\`: Function to calculate distance between two geographical points
- \`.env\`: Environment variables (not included in the repository)

## 📄 License
This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.

## 🙏 Acknowledgements
- [Telegraf](https://github.com/telegraf/telegraf)
- [Geoapify](https://www.geoapify.com/)
- [UNCISAL](https://uncisal.edu.br/)