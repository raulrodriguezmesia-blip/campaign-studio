#!/bin/bash
# Simple HTTP server for Campaign Studio Frontend

cd /c/Users/campaign-studio

echo "🚀 Starting Campaign Studio Frontend Server..."
echo "🌐 Access at: http://localhost:3000"

# Use Python's built-in HTTP server
python -m http.server 3000