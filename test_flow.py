#!/usr/bin/env python3
import requests
import json
import subprocess
import time

# Gerar usuário de teste
test_email = "teste.flow@gmail.com"
test_password = "TesteSeguro123!"

print("🔥 TESTANDO CADASTRO...")
response = requests.post("https://www.betforbes.com/api/auth/register", json={
    "name": "Teste Flow",
    "email": test_email,
    "password": test_password
} )
print(f"Cadastro: {response.status_code} - {response.json()}")

if response.status_code == 201:
    time.sleep(2)
    
    print("\n📧 BUSCANDO TOKEN...")
    result = subprocess.run([
        'sudo', '-u', 'postgres', 'psql', '-d', 'betforbes_db', '-t', '-c',
        f'SELECT token FROM email_verification_tokens WHERE "userId" = (SELECT id FROM users WHERE email = \'{test_email}\') ORDER BY "createdAt" DESC LIMIT 1;'
    ], capture_output=True, text=True)
    
    token = result.stdout.strip()
    print(f"Token: {token[:20]}...")
    
    print("\n✅ TESTANDO VERIFICAÇÃO...")
    verify_response = requests.get(f"https://www.betforbes.com/api/auth/verify-email?token={token}" )
    print(f"Verificação: {verify_response.status_code}")
    
    time.sleep(2)
    
    print("\n🔐 TESTANDO LOGIN...")
    login_response = requests.post("https://www.betforbes.com/api/auth/login", json={
        "email": test_email,
        "password": test_password
    } )
    print(f"Login: {login_response.status_code} - {login_response.json()}")
    
    # Limpeza
    subprocess.run(['sudo', '-u', 'postgres', 'psql', '-d', 'betforbes_db', '-c', f'DELETE FROM users WHERE email = \'{test_email}\';'])
