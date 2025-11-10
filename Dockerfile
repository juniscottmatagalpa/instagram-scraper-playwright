# Usa la imagen oficial con todos los binarios de Chromium
FROM mcr.microsoft.com/playwright:v1.48.2-jammy

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Render define automáticamente PORT
ENV PORT=10000
EXPOSE 10000

# Inicia el servidor
CMD ["npm", "start"]
