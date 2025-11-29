from flask import Flask, request, jsonify, send_from_directory
from flask_mysqldb import MySQL
from flask_cors import CORS
from config import config
import random
import string
import os
from werkzeug.utils import secure_filename

# Generar una contraseña temporal aleatoria
def generar_password_temporal(longitud=8):
    caracteres = string.ascii_letters + string.digits
    return ''.join(random.choice(caracteres) for _ in range(longitud))

# Configurar conexion a la base de datos y CORS
app = Flask(__name__)
app.config.from_object(config['development'])
CORS(app, resources={r"/*": {"origins": "http://localhost:4200"}})

mysql = MySQL(app)


# Ruta absoluta a la carpeta de avatares (ajustado a tu estructura: src/static/avatars)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))  # carpeta src
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'avatars')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# sirve para cargar imagenes de usuario
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

#Sistema de login
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
        sql = """
            SELECT usuarioid, username, email, `contraseña-hash`, rol, avatar, nombre, telefono, biografia
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
        avatar = datos[5]
        nombre = datos[6]
        telefono = datos[7]
        biografia = datos[8]

        if password != password_bd:
            return jsonify({'mensaje': 'Contraseña incorrecta', 'exito': False}), 401

        usuario = {
            'usuarioid': usuarioid,
            'username': username,
            'email': email_bd,
            'rol': rol,
            'avatar': avatar,
            'nombre': nombre,
            'telefono': telefono,
            'biografia': biografia
        }

        return jsonify({'mensaje': 'Login exitoso', 'exito': True, 'usuario': usuario}), 200

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

        sql_check = "SELECT usuarioid FROM usuarios WHERE email = %s"
        cursor.execute(sql_check, (email,))
        existe = cursor.fetchone()
        print("¿Existe usuario?:", existe)  # DEBUG

        if existe is not None:
            return jsonify({'mensaje': 'El email ya está registrado', 'exito': False}), 409

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
        print("ERROR en /register:", ex)
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

        sql_check = "SELECT usuarioid FROM usuarios WHERE email = %s"
        cursor.execute(sql_check, (email,))
        usuario = cursor.fetchone()

        if usuario is None:
            return jsonify({'mensaje': 'No existe una cuenta con ese email', 'exito': False}), 404

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


#Perfil usuario
@app.route('/api/actualizar_perfil', methods=['POST'])
def actualizar_perfil():
    try:
        usuarioid = request.form.get('usuarioid')
        username  = request.form.get('username')
        nombre    = request.form.get('nombre')
        telefono  = request.form.get('telefono')
        biografia = request.form.get('biografia')

        print("Datos recibidos en /api/actualizar_perfil:")
        print("usuarioid:", usuarioid)
        print("username:", username)
        print("nombre:", nombre)
        print("telefono:", telefono)
        print("biografia:", biografia)

        if not usuarioid:
            return jsonify({'exito': False, 'mensaje': 'Falta usuarioid'}), 400

        avatar_file = request.files.get('avatar')
        avatar_filename = None

        if avatar_file and allowed_file(avatar_file.filename):
            original_filename = secure_filename(avatar_file.filename)
            _, ext = os.path.splitext(original_filename)
            filename = f"user_{usuarioid}{ext}"
            save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            avatar_file.save(save_path)
            avatar_filename = filename
            print("Avatar guardado como:", avatar_filename)

        cursor = mysql.connection.cursor()

        if avatar_filename:
            sql = """
                UPDATE usuarios
                SET username = %s,
                    nombre   = %s,
                    telefono = %s,
                    biografia = %s,
                    avatar   = %s
                WHERE usuarioid = %s
            """
            cursor.execute(sql, (username, nombre, telefono, biografia, avatar_filename, usuarioid))
        else:
            sql = """
                UPDATE usuarios
                SET username = %s,
                    nombre   = %s,
                    telefono = %s,
                    biografia = %s
                WHERE usuarioid = %s
            """
            cursor.execute(sql, (username, nombre, telefono, biografia, usuarioid))

        mysql.connection.commit()

        # Volver a leer el usuario
        sql_select = """
            SELECT usuarioid, username, email, nombre, telefono, biografia, avatar, rol
            FROM usuarios
            WHERE usuarioid = %s
        """
        cursor.execute(sql_select, (usuarioid,))
        row = cursor.fetchone()
        cursor.close()

        if not row:
            return jsonify({'exito': False, 'mensaje': 'Usuario no encontrado'}), 404

        usuario = {
            'usuarioid': row[0],
            'username':  row[1],
            'email':     row[2],
            'nombre':    row[3],
            'telefono':  row[4],
            'biografia': row[5],
            'avatar':    row[6],
            'rol':       row[7]
        }

        return jsonify({
            'exito': True,
            'mensaje': 'Perfil actualizado',
            'usuario': usuario
        })

    except Exception as e:
        print("Error en /api/actualizar_perfil:", e)
        return jsonify({'exito': False, 'mensaje': f'Error en el servidor: {e}'}), 500

# Obtener todos los usuarios 
@app.route('/admin/usuarios', methods=['GET'])
def obtener_usuarios():
    try:
        cursor = mysql.connection.cursor()
        sql = """
            SELECT usuarioid, username, email, rol, avatar, nombre, telefono, biografia, registrofecha
            FROM usuarios
        """
        cursor.execute(sql)
        filas = cursor.fetchall()

        usuarios = []
        for fila in filas:
            usuarios.append({
                'id': fila[0],
                'username': fila[1],
                'email': fila[2],
                'rol': fila[3],
                'avatar': fila[4],
                'nombre': fila[5],
                'telefono': fila[6],
                'biografia': fila[7],
                # Campos fake para que tu UI no truene:
                'estado': 'active',          # si no tienes columna, lo dejamos fijo
                'miembroDesde': '2024-01-01',
                'comprasTotales': 0,
                'gastoTotal': 0,
                'ultimoAcceso': '2024-01-01'
            })

        return jsonify({'exito': True, 'usuarios': usuarios}), 200
    except Exception as ex:
        print("ERROR en /admin/usuarios:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error en el servidor: {ex}'}), 500


# Actualizar datos básicos (rol, estado, nombre, email)
@app.route('/admin/usuarios/<int:usuarioid>', methods=['PUT'])
def actualizar_usuario_admin(usuarioid):
    try:
        data = request.get_json()
        rol = data.get('rol')
        nombre = data.get('nombre')
        email = data.get('email')
        # si más adelante agregas columna 'estado' la manejas aquí

        cursor = mysql.connection.cursor()
        sql = """
            UPDATE usuarios
            SET rol = %s,
                nombre = %s,
                email = %s
            WHERE usuarioid = %s
        """
        cursor.execute(sql, (rol, nombre, email, usuarioid))
        mysql.connection.commit()

        return jsonify({'exito': True, 'mensaje': 'Usuario actualizado correctamente'}), 200
    except Exception as ex:
        print("ERROR en PUT /admin/usuarios/<id>:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error en el servidor: {ex}'}), 500


# Eliminar usuario
@app.route('/admin/usuarios/<int:usuarioid>', methods=['DELETE'])
def eliminar_usuario_admin(usuarioid):
    try:
        cursor = mysql.connection.cursor()
        sql = "DELETE FROM usuarios WHERE usuarioid = %s"
        cursor.execute(sql, (usuarioid,))
        mysql.connection.commit()

        return jsonify({'exito': True, 'mensaje': 'Usuario eliminado'}), 200
    except Exception as ex:
        print("ERROR en DELETE /admin/usuarios/<id>:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error en el servidor: {ex}'}), 500
# Crear nuevo usuario (ADMIN)
@app.route('/admin/usuarios', methods=['POST'])
def crear_usuario_admin():
    try:
        data = request.get_json()
        print("Datos recibidos en POST /admin/usuarios:", data)

        username  = data.get('username')
        email     = data.get('email')
        password  = data.get('password')
        rol       = data.get('rol', 'client')
        nombre    = data.get('nombre', '')
        telefono  = data.get('telefono', '')
        biografia = data.get('biografia', '')

        avatar = data.get('avatar') or 'default_avatar.jpg'

        if not username or not email or not password:
            return jsonify({
                'exito': False,
                'mensaje': 'Username, email y contraseña son obligatorios'
            }), 400

        cursor = mysql.connection.cursor()

        # Validar que no exista el email
        cursor.execute("SELECT usuarioid FROM usuarios WHERE email = %s", (email,))
        existe = cursor.fetchone()
        if existe:
            return jsonify({
                'exito': False,
                'mensaje': 'Ya existe un usuario con ese email'
            }), 400

        # Aquí podrías hashear la contraseña si quisieras
        password_hash = password  # OJO: en producción usa hash (bcrypt, etc.)

        sql = """
            INSERT INTO usuarios (username, email, `contraseña-hash`, rol, avatar, nombre, telefono, biografia)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(
            sql,
            (username, email, password_hash, rol, avatar, nombre, telefono, biografia)
        )
        mysql.connection.commit()

        nuevo_id = cursor.lastrowid

        usuario_creado = {
            'id': nuevo_id,
            'username': username,
            'email': email,
            'rol': rol,
            'avatar': avatar,
            'nombre': nombre,
            'telefono': telefono,
            'biografia': biografia,
            'estado': 'active',
            'miembroDesde': '2024-01-01',
            'comprasTotales': 0,
            'gastoTotal': 0,
            'ultimoAcceso': '2024-01-01'
        }

        return jsonify({
            'exito': True,
            'mensaje': 'Usuario creado correctamente',
            'usuario': usuario_creado
        }), 201

    except Exception as ex:
        print("ERROR en POST /admin/usuarios:", ex)
        return jsonify({
            'exito': False,
            'mensaje': f'Error en el servidor: {ex}'
        }), 500

def pagina_no_encontrada(error):
    return "<h1>Pagina no encontrada</h1>", 404

if __name__ == "__main__":
    app.register_error_handler(404, pagina_no_encontrada)
    app.run(host='0.0.0.0', port=5000, debug=True)
