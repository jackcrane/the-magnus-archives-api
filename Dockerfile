# Base image
FROM node:16
RUN --mount=type=secret,id=DATABASE_URL \
  cat /run/secrets/DATABASE_URL

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock files
COPY package.json ./

# Install dependencies
RUN yarn

# Copy all files
COPY . .

# Log env variables
RUN printenv

# Build the Prisma database
RUN yarn build_db

# Expose the application port
EXPOSE 4000

# Start the application
CMD ["yarn", "start"]