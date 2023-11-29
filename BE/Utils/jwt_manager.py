from jwt import decode, encode

def create_token(payload, secret_key, algorithm="HS256"):
    encoded_jwt = encode(payload, secret_key, algorithm)
    return encoded_jwt

def validate_token(token, secret_key, algorithm="HS256"):
    decoded_jwt = decode(token, secret_key, algorithms=[algorithm])
    return decoded_jwt