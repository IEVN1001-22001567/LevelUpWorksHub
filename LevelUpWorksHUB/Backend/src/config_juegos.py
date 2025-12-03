import os

class DevelopmentConfig():
    DEBUG = True
    MYSQL_HOST = 'localhost'
    MYSQL_USER = 'root'
    MYSQL_PASSWORD = ''
    MYSQL_DB = 'levelupworks'
    

    JUEGOS_FOLDER = r'C:\JuegosLevelUp'

config = {
    'development': DevelopmentConfig
}

os.makedirs(DevelopmentConfig.JUEGOS_FOLDER, exist_ok=True)
print(f"Carpeta de juegos: {DevelopmentConfig.JUEGOS_FOLDER}")
