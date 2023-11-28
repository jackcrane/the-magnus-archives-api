# Base image
FROM node:16
RUN --mount=type=secret,id=DATABASE_URL \
  cat /run/secrets/DATABASE_URL

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock files
COPY package.json ./

# Install dependencies
RUN yarn

# Copy all files
COPY . .
RUN cd ./fe && yarn && cd ..

# Log env variables
RUN printenv

# Build the Prisma database and frontend
RUN yarn build_db && yarn build_fe

# Expose the application port
EXPOSE 4000

# Start the application
CMD ["yarn", "start"]