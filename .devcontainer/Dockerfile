FROM node:18-bullseye

WORKDIR /workspace

RUN apt-get update \ 
  && apt-get install -y --no-install-recommends git ca-certificates \ 
  && rm -rf /var/lib/apt/lists/*

CMD ["sleep", "infinity"]
