# Imagen base de Node
FROM node:20

# Carpeta de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiamos sólo package.json y package-lock.json primero (para aprovechar la cache)
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto del backend
EXPOSE 3001

# Comando por defecto
CMD ["npm", "start"]
