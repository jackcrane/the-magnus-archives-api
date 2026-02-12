# Base image
FROM node:16-bullseye

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock files
COPY package.json ./

# Install dependencies
RUN yarn

# Install Postgres
RUN apt-get update \
  && apt-get install -y postgresql \
  && rm -rf /var/lib/apt/lists/*

# Copy all files
COPY . .

# Add entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose the application port
EXPOSE 4000

# Start the application
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
