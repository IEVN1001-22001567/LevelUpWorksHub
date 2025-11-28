from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
from config import config
import random
import string

def generar_password_temporal(longitud=8):
    caracteres = string.ascii_letters + string.digits
    return ''.join(random.choice(caracteres) for _ in range(longitud))



app = Flask(__name__)
app.config.from_object(config['development'])

# CORS para todo desde Angular
CORS(app, resources={r"/*": {"origins": "http://localhost:4200"}})

mysql = MySQL(app)  # cambié el nombre a mysql para evitar confusiones

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        print("Datos recibidos en /login:", data)  # DEBUG

        email = data.get('email') if data else None
        password = data.get('password') if data else None

        if not email or not password:
            return jsonify({'mensaje': 'Faltan datos', 'exito': False}), 400

        cursor = mysql.connection.cursor()
        # OJO: campo con acento y guion se escapa con backticks
        sql = """
            SELECT usuarioid, username, email, `contraseña-hash`, rol
            FROM usuarios
            WHERE email = %s
        """
        cursor.execute(sql, (email,))
        datos = cursor.fetchone()
        print("Resultado consulta login:", datos)  # DEBUG

        if datos is None:
            return jsonify({'mensaje': 'Usuario no encontrado', 'exito': False}), 401

        usuarioid = datos[0]
        username = datos[1]
        email_bd = datos[2]
        password_bd = datos[3]
        rol = datos[4]

        # Comparación directa por ahora
        if password != password_bd:
            return jsonify({'mensaje': 'Contraseña incorrecta', 'exito': False}), 401

        user_data = {
            'usuarioid': usuarioid,
            'username': username,
            'email': email_bd,
            'rol': rol
        }

        return jsonify({'mensaje': 'Login exitoso', 'exito': True, 'usuario': user_data}), 200

    except Exception as ex:
        print("ERROR en /login:", ex) 
        return jsonify({'mensaje': f'Error en el servidor: {ex}', 'exito': False}), 500


@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        print("Datos recibidos en /register:", data)  # DEBUG

        username = data.get('username') if data else None
        email = data.get('email') if data else None
        password = data.get('password') if data else None

        if not username or not email or not password:
            return jsonify({'mensaje': 'Faltan datos', 'exito': False}), 400

        cursor = mysql.connection.cursor()

        # 1. Verificar si ya existe ese email
        sql_check = "SELECT usuarioid FROM usuarios WHERE email = %s"
        cursor.execute(sql_check, (email,))
        existe = cursor.fetchone()
        print("¿Existe usuario?:", existe)  # DEBUG

        if existe is not None:
            return jsonify({'mensaje': 'El email ya está registrado', 'exito': False}), 409

        # 2. Insertar usuario nuevo
        sql_insert = """
            INSERT INTO usuarios (username, email, `contraseña-hash`, avatar, rol, registrofecha)
            VALUES (%s, %s, %s, %s, %s, NOW())
        """
        avatar_por_defecto = ''
        rol_por_defecto = 'cliente'

        cursor.execute(sql_insert, (username, email, password, avatar_por_defecto, rol_por_defecto))
        mysql.connection.commit()

        return jsonify({'mensaje': 'Usuario registrado correctamente', 'exito': True}), 201

    except Exception as ex:
        print("ERROR en /register:", ex)  # MUY IMPORTANTE
        return jsonify({'mensaje': f'Error en el servidor: {ex}', 'exito': False}), 500

@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email') if data else None
        new_password = data.get('password') if data else None
        print("Solicitud de recuperación para:", email, "nueva pass:", new_password)

        if not email or not new_password:
            return jsonify({'mensaje': 'Debes proporcionar email y nueva contraseña', 'exito': False}), 400

        cursor = mysql.connection.cursor()

        # Verificar si el usuario existe
        sql_check = "SELECT usuarioid FROM usuarios WHERE email = %s"
        cursor.execute(sql_check, (email,))
        usuario = cursor.fetchone()

        if usuario is None:
            return jsonify({'mensaje': 'No existe una cuenta con ese email', 'exito': False}), 404

        # Actualizar con la nueva contraseña que el usuario escribió
        sql_update = "UPDATE usuarios SET `contraseña-hash` = %s WHERE email = %s"
        cursor.execute(sql_update, (new_password, email))
        mysql.connection.commit()

        return jsonify({
            'mensaje': 'Contraseña actualizada correctamente. Ahora puedes iniciar sesión con la nueva contraseña.',
            'exito': True
        }), 200

    except Exception as ex:
        print("ERROR en /forgot-password:", ex)
        return jsonify({'mensaje': f'Error en el servidor: {ex}', 'exito': False}), 500


def pagina_no_encontrada(error):
    return "<h1>Pagina no encontrada</h1>", 404


if __name__ == "__main__":
    app.register_error_handler(404, pagina_no_encontrada)
    app.run(host='0.0.0.0', port=5000, debug=True)
