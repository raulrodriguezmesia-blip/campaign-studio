#!/usr/bin/env python3
"""Script para probar Campaign Studio con API key real"""

import os
import sys
import requests

# URL del servidor (cambiar si está en otro lugar)
BASE_URL = os.getenv('CAMPAIGN_URL', 'http://localhost:8000')

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f'{BASE_URL}/api/health', timeout=5)
        if response.status_code == 200:
            print("[PASS] Health check passed")
            print(f"       Response: {response.json()}")
            return True
        else:
            print(f"[FAIL] Health check failed with status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("[SKIP] Server not running. Start with: uvicorn backend.src.main:app --port 8000")
        return False
    except Exception as e:
        print(f"[FAIL] Error: {e}")
        return False

def test_generate_campaign():
    """Test generate campaign endpoint"""
    # Verificar si hay API key configurada
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key or api_key.startswith('sk-test'):
        print("[SKIP] No real API key configured. Set OPENAI_API_KEY environment variable.")
        return False
    
    test_brief = {
        'campaign_brief': 'Lanzamiento de una nueva app de delivery de comida saludable',
        'target_audience': 'Profesionales urbanos de 25-40 años que buscan comida rápida y saludable',
        'product_details': 'App móvil con restaurantes certificados, menús nutricionales, entrega en 30 minutos',
        'tone': 'Profesional y confiable',
        'channels': 'Instagram, Facebook, Google Ads, TikTok'
    }
    
    try:
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.post(
            f'{BASE_URL}/api/generate',
            json=test_brief,
            headers=headers,
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            print("[PASS] Campaign generated successfully!")
            print(f"       Concept: {data.get('campaignConcept', 'N/A')[:100]}...")
            print(f"       Variants: {len(data.get('variants', []))}")
            print(f"       Checklist: {len(data.get('checklist', []))} items")
            print(f"       Image prompts: {len(data.get('imagePrompts', []))}")
            
            # Mostrar variantes de copy
            print("\n       Copy variants:")
            for i, variant in enumerate(data.get('variants', []), 1):
                headline = variant.get('headline', 'N/A')
                body = variant.get('body', 'N/A')
                print(f"         {i}. {headline}")
                print(f"            {body[:80]}...")
            
            return True
        else:
            print(f"[FAIL] Failed to generate campaign: {response.status_code}")
            print(f"       Response: {response.text[:200]}")
            return False
            
    except requests.exceptions.Timeout:
        print("[FAIL] Request timed out")
        return False
    except Exception as e:
        print(f"[FAIL] Error: {e}")
        return False

def main():
    print("=" * 60)
    print("Campaign Studio - Prueba con API Key Real")
    print("=" * 60)
    print()
    
    print("NOTA: Para probar con una API key real, configura la variable:")
    print("      export OPENAI_API_KEY=sk-tu-api-key-real")
    print()
    
    print("Pasos para probar:")
    print("1. Inicia el servidor: uvicorn backend.src.main:app --port 8000")
    print("2. Ejecuta este script: python test_real.py")
    print()
    
    # Test health check
    print("1. Testing health endpoint...")
    health_passed = test_health()
    print()
    
    if health_passed:
        # Test generate campaign
        print("2. Testing campaign generation...")
        gen_passed = test_generate_campaign()
        print()
        
        if gen_passed:
            print("=" * 60)
            print("Todas las pruebas completadas!")
            print("=" * 60)
        else:
            print("=" * 60)
            print("Pruebas completadas (algunas omitidas por falta de API key)")
            print("=" * 60)
    else:
        print("El servidor no esta disponible. Inicializalo y ejecuta de nuevo.")

if __name__ == '__main__':
    main()