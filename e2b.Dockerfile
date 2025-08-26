# Use a Python base image that's more suited for scientific computing
FROM python:3.10-slim

# Use Python base image which has build tools pre-installed
FROM python:3.10-slim

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies for Manim
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    pkg-config \
    python3-cairo-dev \
    libgirepository1.0-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*# Upgrade pip
RUN pip install --upgrade pip

# Install Manim
RUN pip install manim

# Set working directory
WORKDIR /code