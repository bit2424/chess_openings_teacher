## A Web-Based Openings Chess Teacher powered by LLMs

Welcome to the README for chess_openings_teacher! This project is a web application that combines the power of LLMs and Docker to create a unique and engaging chess learning experience.

## What it is:
chess_openings_teacher offers an interactive platform for chess enthusiasts beginning their chess journey:

- Play against an LLM-powered mini-engine: Challenge yourself with a custom chess engine trained on LLM models using PyTorch and HuggingFace.
- Seek opening insights: Unsure of the best move in a specific opening? Consult the LLM for its recommended continuation and gain valuable strategic knowledge.
- Observe LLM vs. LLM battles: Witness the fascinating duel of two LLMs as they compete against each other, learning from their tactical decisions and positional understanding.
- Dockerized for easy setup and scalability: Each project section (frontend, backend, and LLM models) runs independently within its own Docker container, simplifying deployment and scaling.

## Project Structure:

```bash
.
├── BE
│   ├── Dockerfile
│   ├── Model
│   ├── README.md
│   ├── Utils
│   ├── __pycache__
│   ├── docker-compose.yml
│   ├── main.py
│   └── requirements.txt
├── Front
│   ├── Dockerfile
│   ├── cot-front
│   ├── docker-compose.yml
│   ├── package-lock.json
│   └── package.json
├── ML
│   ├── Chess_engine
│   ├── Dataset_Creation
│   ├── Dockerfile
│   ├── Readme.md
│   ├── Training
│   ├── docker-compose.yml
│   └── requirements.txt
└── README.md

```
- Front (Nuxt3): Handles the user interface and interaction with the backend API.
- BE (FastAPI): Runs the game logic, interacts with the LLM models, and provides an API for the frontend.
- ML (Pytorch): Houses the pre-trained LLM models used for analysis and move recommendations, the datasets used for training these models, and the algorithms used for the training process.

## Current state of the game:
At this point in development, I have a fully functioning website where you can play chess with yourself; I also have some trained LLMs who can recommend moves, but these two sides of the project are not integrated yet. Some blinking moves are recommended by a really basic chess engine, but the LLMs do not give these recommendations yet.

<img width="915" alt="image" src="https://github.com/bit2424/chess_openings_teacher/assets/44851531/47786c85-50f6-4465-8027-16f210a25e36">
<img width="915" alt="image" src="https://github.com/bit2424/chess_openings_teacher/assets/44851531/8392ed35-dc4f-437d-a6dc-5029119f8535">




