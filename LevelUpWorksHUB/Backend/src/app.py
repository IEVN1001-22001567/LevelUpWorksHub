from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_mysqldb import MySQL
from flask_cors import CORS
from config import config
import random
from datetime import datetime
import string
import os
from werkzeug.utils import secure_filename
import traceback

# Local storage service for external juegos folder
from config_juegos import DevelopmentConfig
from juegos_storage_service import JuegosStorageService

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

# Carpeta donde guardarás las portadas
PORTADAS_FOLDER = os.path.join(app.root_path, 'static', 'portadas')
os.makedirs(PORTADAS_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Inicializar el servicio de almacenamiento de juegos en carpeta externa
storage_service = JuegosStorageService(DevelopmentConfig.JUEGOS_FOLDER)

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
        # IMPORTANTE: incluimos saldo en el SELECT
        sql = """
            SELECT 
                usuarioid,        -- 0
                username,         -- 1
                email,            -- 2
                `contraseña-hash`,-- 3
                rol,              -- 4
                avatar,           -- 5
                nombre,           -- 6
                telefono,         -- 7
                biografia,        -- 8
                saldo             -- 9
            FROM usuarios
            WHERE email = %s
        """
        cursor.execute(sql, (email,))
        datos = cursor.fetchone()
        print("Resultado consulta login:", datos)  # DEBUG

        if datos is None:
            return jsonify({'mensaje': 'Usuario no encontrado', 'exito': False}), 401

        usuarioid   = datos[0]
        username    = datos[1]
        email_bd    = datos[2]
        password_bd = datos[3]
        rol         = datos[4]
        avatar      = datos[5]
        nombre      = datos[6]
        telefono    = datos[7]
        biografia   = datos[8]
        saldo_bd    = datos[9]  

        # Validar contraseña
        if password != password_bd:
            return jsonify({'mensaje': 'Contraseña incorrecta', 'exito': False}), 401

        print("Saldo BD:", saldo_bd)  # DEBUG

        usuario = {
            'usuarioid': usuarioid,
            'username':  username,
            'email':     email_bd,
            'rol':       rol,
            'saldo':     float(saldo_bd) if saldo_bd is not None else 0.0,
            'avatar':    avatar,
            'nombre':    nombre,
            'telefono':  telefono,
            'biografia': biografia,
            
        }

        print("Usuario a devolver en /login:", usuario)  # DEBUG

        return jsonify({
            'mensaje': 'Login exitoso',
            'exito': True,
            'usuario': usuario
        }), 200

    except Exception as ex:
        print("ERROR en /login:", ex)
        return jsonify({
            'mensaje': f'Error en el servidor: {ex}',
            'exito': False
        }), 500

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
@app.route('/api/admin/usuarios', methods=['GET'])
def obtener_usuarios():
    try:
        cursor = mysql.connection.cursor()
        sql = """
            SELECT usuarioid, username, email, rol, avatar, nombre, telefono, biografia, registrofecha, saldo
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
                'estado': 'active',          # si no tienes columna, lo dejamos fijo
                'miembroDesde': '2024-01-01',
                'comprasTotales': 0,
                'gastoTotal': 0,
                'ultimoAcceso': '2024-01-01',
                'saldo': float(fila[9]),
                'registrofecha': fila[8].strftime('%Y-%m-%d')


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
###############################################
#                 ADMIN PSYCHO               
###############################################

# ---- OBTENER TODOS LOS ARTÍCULOS ----
@app.route('/psycho/articulos', methods=['GET'])
def obtener_articulos():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM articulos_psycho")
        datos = cur.fetchall()
        cur.close()

        articulos = []
        for fila in datos:
            articulos.append({
                "id_articulo": fila[0],
                "titulo": fila[1],
                "categoria": fila[2],
                "resumen": fila[3],
                "contenido": fila[4],
                "tiempo_lectura": fila[5],
                "url_imagen": fila[6],
                "fecha_publicacion": str(fila[7])
            })

        return jsonify({
            "exito": True,
            "articulos": articulos
        })

    except Exception as ex:
        print("ERROR:", ex)
        return jsonify({"exito": False, "mensaje": str(ex)}), 500


# ---- CREAR ARTÍCULO ----
@app.route('/psycho/articulos', methods=['POST'])
def crear_articulo():
    try:
        data = request.json

        campos = ["titulo", "categoria", "resumen", "contenido", "tiempo_lectura"]
        for c in campos:
            if c not in data:
                return jsonify({"exito": False, "mensaje": f"Falta el campo {c}"}), 400

        cur = mysql.connection.cursor()
        cur.execute("""
            INSERT INTO articulos_psycho 
            (titulo, categoria, resumen, contenido, tiempo_lectura, url_imagen, fecha_publicacion)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """, (
            data['titulo'],
            data['categoria'],
            data['resumen'],
            data['contenido'],
            data['tiempo_lectura'],
            data.get('url_imagen', '')
        ))
        mysql.connection.commit()
        cur.close()

        return jsonify({"exito": True, "message": "Artículo creado correctamente"}), 201

    except Exception as ex:
        print("ERROR:", ex)
        return jsonify({"exito": False, "mensaje": str(ex)}), 500


# ---- EDITAR ARTÍCULO ----
@app.route('/psycho/articulos/<int:id_articulo>', methods=['PUT'])
def editar_articulo(id_articulo):
    try:
        data = request.json

        cur = mysql.connection.cursor()
        cur.execute("""
            UPDATE articulos_psycho SET
                titulo=%s,
                categoria=%s,
                resumen=%s,
                contenido=%s,
                tiempo_lectura=%s,
                url_imagen=%s
            WHERE id_articulo=%s
        """, (
            data['titulo'],
            data['categoria'],
            data['resumen'],
            data['contenido'],
            data['tiempo_lectura'],
            data.get('url_imagen', ''),
            id_articulo
        ))

        mysql.connection.commit()
        cur.close()

        return jsonify({"exito": True, "message": "Artículo actualizado correctamente"})

    except Exception as ex:
        print("ERROR:", ex)
        return jsonify({"exito": False, "mensaje": str(ex)}), 500


# ---- ELIMINAR ARTÍCULO ----
@app.route('/psycho/articulos/<int:id_articulo>', methods=['DELETE'])
def eliminar_articulo(id_articulo):
    try:
        cur = mysql.connection.cursor()
        cur.execute("DELETE FROM articulos_psycho WHERE id_articulo=%s", (id_articulo,))
        mysql.connection.commit()
        cur.close()

        return jsonify({"exito": True, "message": "Artículo eliminado correctamente"})

    except Exception as ex:
        print("ERROR:", ex)
        return jsonify({"exito": False, "mensaje": str(ex)}), 500


""" ---------------------SOPORTE TECNICO------------------------------------------ """
@app.route('/soporte/tickets', methods=['POST'])
def crear_ticket():
    data = request.json

    asunto = data.get("asunto")
    descripcion = data.get("descripcion")
    correo = data.get("correo")

    cur = mysql.connection.cursor()
    cur.execute("""
        INSERT INTO tickets_soporte (asunto, descripcion, correo)
        VALUES (%s, %s, %s)
    """, (asunto, descripcion, correo))

    mysql.connection.commit()
    return jsonify({"status": "ok", "message": "Ticket creado correctamente"})

@app.route('/soporte/tickets', methods=['GET'])
def obtener_tickets():
    correo = request.args.get("correo")
    
    cur = mysql.connection.cursor()
    cur.execute("""
        SELECT id_ticket, asunto, descripcion, correo, fecha_creacion, estado
        FROM tickets_soporte
        WHERE correo = %s
        ORDER BY fecha_creacion DESC
    """, (correo,))
    
    data = cur.fetchall()
    
    tickets = []
    for t in data:
        tickets.append({
            "id_ticket": t[0],
            "asunto": t[1],
            "descripcion": t[2],
            "correo": t[3],
            "fecha_creacion": str(t[4]),
            "estado": t[5]
        })
    
    return jsonify(tickets)

@app.route('/admin/tickets', methods=['GET'])
def admin_obtener_tickets():
    cur = mysql.connection.cursor()
    cur.execute("""
        SELECT id_ticket, asunto, descripcion, correo, fecha_creacion, estado 
        FROM tickets_soporte
        ORDER BY fecha_creacion DESC
    """)
    data = cur.fetchall()

    tickets = []
    for t in data:
        tickets.append({
            "id_ticket": t[0],
            "asunto": t[1],
            "descripcion": t[2],
            "correo": t[3],
            "fecha_creacion": str(t[4]),
            "estado": t[5]
        })
    
    return jsonify(tickets)

@app.route('/admin/tickets/<int:id_ticket>', methods=['PUT'])
def admin_actualizar_ticket(id_ticket):
    data = request.json
    nuevo_estado = data.get("estado")

    cur = mysql.connection.cursor()
    cur.execute("""
        UPDATE tickets_soporte SET estado = %s WHERE id_ticket = %s
    """, (nuevo_estado, id_ticket))

    mysql.connection.commit()
    return jsonify({"message": "Estado actualizado"})

@app.route('/admin/tickets/<int:id_ticket>', methods=['DELETE'])
def admin_eliminar_ticket(id_ticket):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM tickets_soporte WHERE id_ticket = %s", (id_ticket,))
    mysql.connection.commit()
    return jsonify({"message": "Ticket eliminado"})



@app.route('/admin/juegos', methods=['POST'])
def crear_juego():
    try:
        print("POST /admin/juegos (crear juego)")

        # Como viene multipart/form-data
        title = request.form.get('title')
        genre = request.form.get('genre')
        platform = request.form.get('platform')
        description = request.form.get('description', '')
        price = request.form.get('price', '0')

        if not title or not genre or not platform:
            return jsonify({'exito': False, 'mensaje': 'Título, género y plataforma son obligatorios'}), 400

        price_val = float(price)

        cursor = mysql.connection.cursor()

        # ======= PORTADA (imagen) - Siempre local =======
        portada_filename = None
        if 'image' in request.files:
            imagen_file = request.files['image']
            if imagen_file and imagen_file.filename != '':
                import time
                filename_seguro = secure_filename(imagen_file.filename)
                nombre_archivo_portada = f"{int(time.time())}_{filename_seguro}"

                ruta_carpeta_portadas = os.path.join(app.root_path, 'static', 'portadas')
                os.makedirs(ruta_carpeta_portadas, exist_ok=True)
                ruta_completa_portada = os.path.join(ruta_carpeta_portadas, nombre_archivo_portada)
                imagen_file.save(ruta_completa_portada)

                portada_filename = nombre_archivo_portada

        # ======= ARCHIVO DEL JUEGO (ZIP/EXE) - Almacenamiento local (carpeta externa) =======
        archivo_instalador = None
        tamano_archivo = None

        if 'installer' in request.files:
            game_file = request.files['installer']
            if game_file and game_file.filename != '':
                import time
                filename_seguro = secure_filename(game_file.filename)
                nombre_archivo_juego = f"{int(time.time())}_{filename_seguro}"

                # Guardar temporalmente para luego moverlo a la carpeta externa
                ruta_temp = os.path.join(app.root_path, 'static', 'temp_juegos')
                os.makedirs(ruta_temp, exist_ok=True)
                ruta_completa_temp = os.path.join(ruta_temp, nombre_archivo_juego)

                game_file.save(ruta_completa_temp)

                # Intentar guardar en la carpeta externa usando el servicio
                try:
                    resultado_guardado = storage_service.guardar_archivo(ruta_completa_temp, nombre_archivo_juego)
                    if resultado_guardado.get('exito'):
                        archivo_instalador = nombre_archivo_juego
                        tamano_archivo = resultado_guardado.get('tamaño')
                    else:
                        # si falla, dejar el archivo en temp y registrar error
                        print(f"No se pudo mover instalador a carpeta externa: {resultado_guardado.get('error')}")
                        archivo_instalador = None
                        tamano_archivo = os.path.getsize(ruta_completa_temp) if os.path.exists(ruta_completa_temp) else None
                except Exception as e:
                    print(f"Error guardando instalador en carpeta externa: {e}")
                    archivo_instalador = None
                    try:
                        tamano_archivo = os.path.getsize(ruta_completa_temp) if os.path.exists(ruta_completa_temp) else None
                    except:
                        tamano_archivo = None

                # eliminar temporal (si existe)
                try:
                    if os.path.exists(ruta_completa_temp):
                        os.remove(ruta_completa_temp)
                except Exception as e:
                    print(f"Aviso: no se pudo eliminar temporal: {e}")
        # ======= INSERT EN BD =======
        sql = """
            INSERT INTO juegos
            (usuarioid, titulo, genero, portada, plataforma, horasjugadas, fechapublicacion,
             precio, descripcion, archivo_instalador, tamano_archivo)
            VALUES (%s, %s, %s, %s, %s, %s, NOW(), %s, %s, %s, %s)
        """
        usuarioid = 1  # TODO: cambiar al admin logueado

        cursor.execute(sql, (
            usuarioid,
            title,
            genre,
            portada_filename,
            platform,
            0,  # horasjugadas inicial
            price_val,
            description,
            archivo_instalador,
            tamano_archivo
        ))
        mysql.connection.commit()

        nuevo_id = cursor.lastrowid
        cursor.close()

        juego_resp = {
            'id': nuevo_id,
            'title': title,
            'genre': genre,
            'platform': platform,
            'description': description,
            'price': price_val,
            'image': portada_filename,
            'archivo_instalador': archivo_instalador,
            'tamano_archivo': tamano_archivo,
            'publishDate': None,
            'hoursPlayed': 0
        }

        return jsonify({'exito': True, 'mensaje': 'Juego creado correctamente', 'juego': juego_resp}), 201

    except Exception as ex:
        print("ERROR en POST /admin/juegos:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error en el servidor al crear juego: {ex}'}), 500

@app.route('/admin/juegos', methods=['GET'])
def obtener_juegos():
    try:
        cursor = mysql.connection.cursor()
        sql = """
            SELECT 
                juegoID,
                titulo,
                genero,
                descripcion,
                precio,
                portada,
                plataforma,
                horasjugadas,
                fechapublicacion
            FROM juegos
            ORDER BY fechapublicacion DESC
        """
        cursor.execute(sql)
        filas = cursor.fetchall()

        juegos = []
        for fila in filas:
            juegos.append({
                'id': fila[0],
                'title': fila[1],
                'genre': fila[2],
                'description': fila[3],                          # 👈 AQUÍ
                'price': float(fila[4]) if fila[4] is not None else 0,  # 👈 Y AQUÍ
                'image': fila[5],                                # nombre del archivo
                'platform': fila[6],
                'hoursPlayed': fila[7],
                'publishDate': fila[8].strftime('%Y-%m-%d %H:%M:%S') if fila[8] else None
            })

        return jsonify({'exito': True, 'juegos': juegos}), 200

    except Exception as ex:
        print("ERROR en GET /admin/juegos:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error en el servidor al cargar juegos: {ex}'}), 500

@app.route('/admin/juegos/<int:juego_id>', methods=['PUT'])
def actualizar_juego(juego_id):
    try:
        print("PUT /admin/juegos/", juego_id)

        # Como viene multipart/form-data, usamos request.form y request.files
        title = request.form.get('title')
        genre = request.form.get('genre')
        platform = request.form.get('platform')
        description = request.form.get('description', '')
        price = request.form.get('price', '0')

        # Validar obligatorios
        if not title or not genre or not platform:
            return jsonify({'exito': False, 'mensaje': 'Título, género y plataforma son obligatorios'}), 400

        price_val = float(price)

        cursor = mysql.connection.cursor()

        # Ver si viene nueva imagen
        nueva_imagen = None
        if 'image' in request.files:
            imagen_file = request.files['image']
            if imagen_file and imagen_file.filename != '':
                # guardar portada igual que en el POST
                import time
                filename_seguro = secure_filename(imagen_file.filename)
                nombre_archivo = f"{int(time.time())}_{filename_seguro}"
                ruta_carpeta = os.path.join(app.root_path, 'static', 'portadas')
                os.makedirs(ruta_carpeta, exist_ok=True)
                ruta_completa = os.path.join(ruta_carpeta, nombre_archivo)
                imagen_file.save(ruta_completa)

                nueva_imagen = nombre_archivo

        # Armamos el UPDATE dinámico
        campos = [
            "titulo = %s",
            "genero = %s",
            "plataforma = %s",
            "descripcion = %s",
            "precio = %s"
        ]
        valores = [title, genre, platform, description, price_val]

        if nueva_imagen:
            campos.append("portada = %s")
            valores.append(nueva_imagen)

        valores.append(juego_id)

        sql = f"""
            UPDATE juegos
            SET {', '.join(campos)}
            WHERE juegoID = %s
        """

        cursor.execute(sql, tuple(valores))
        mysql.connection.commit()

        # Puedes devolver info del juego actualizado
        resp_juego = {
            'id': juego_id,
            'title': title,
            'genre': genre,
            'platform': platform,
            'description': description,
            'price': price_val,
        }
        if nueva_imagen:
            resp_juego['image'] = nueva_imagen

        return jsonify({'exito': True, 'mensaje': 'Juego actualizado correctamente', 'juego': resp_juego}), 200

    except Exception as ex:
        print("ERROR en PUT /admin/juegos/<id>:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error en el servidor al actualizar juego: {ex}'}), 500


@app.route('/admin/juegos/<int:juego_id>', methods=['DELETE'])
def eliminar_juego(juego_id):
    try:
        if request.method == 'OPTIONS':
            # respuesta para el preflight
            return '', 200

        cursor = mysql.connection.cursor()

        # si quieres, primero obtienes la portada para borrarla del disco
        cursor.execute("SELECT portada FROM juegos WHERE juegoID = %s", (juego_id,))
        fila = cursor.fetchone()

        # borrar el registro
        cursor.execute("DELETE FROM juegos WHERE juegoID = %s", (juego_id,))
        mysql.connection.commit()

        # opcional: borrar la imagen del sistema de archivos
        if fila and fila[0]:
            import os
            ruta_portada = os.path.join(app.root_path, 'static', 'portadas', fila[0])
            if os.path.exists(ruta_portada):
                os.remove(ruta_portada)

        return jsonify({'exito': True, 'mensaje': 'Juego eliminado correctamente'}), 200

    except Exception as ex:
        print("ERROR en DELETE /admin/juegos/<id>:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error en el servidor: {ex}'}), 500



@app.route('/api/biblioteca/<int:usuarioid>', methods=['GET'])
def biblioteca_usuario(usuarioid):
    try:
        cursor = mysql.connection.cursor()
        sql = """
            SELECT comprasID, nombreproducto, descripción, precio, divisa, fechacompra, estado
            FROM compras
            WHERE usuarioid = %s
            ORDER BY fechacompra DESC
        """
        cursor.execute(sql, (usuarioid,))
        filas = cursor.fetchall()
        cursor.close()

        juegos = []
        for fila in filas:
            juegos.append({
                'comprasID': fila[0],
                'nombre': fila[1],
                'descripcion': fila[2],
                'precio': float(fila[3]),
                'divisa': fila[4],
                'fechacompra': fila[5].strftime('%Y-%m-%d %H:%M:%S'),
                'estado': fila[6]
            })

        return jsonify({'exito': True, 'juegos': juegos}), 200

    except Exception as ex:
        print("ERROR en /api/biblioteca/<usuarioid>:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error en el servidor: {ex}'}), 500


# GET /admin/juegos  -> devuelve lista de juegos en formato consistente para el front
@app.route('/tienda', methods=['GET'])
def listar_juegos():
    try:
        cursor = mysql.connection.cursor()
        # ajusta nombres de columnas si los tienes distintos; esta consulta usa la tabla 'juegos'
        sql = """
            SELECT juegoID, usuarioid, titulo, descripcion, genero, precio, portada, plataforma,
                   horasjugadas, estado, fechapublicacion, archivo_instalador, tamano_archivo
            FROM juegos
            WHERE 1
            ORDER BY fechapublicacion DESC
        """
        cursor.execute(sql)
        filas = cursor.fetchall()

        juegos = []
        # filas puede devolverse como tu driver lo haga; flask_mysqldb devuelve tuplas.
        for f in filas:
            # si fetchall devuelve tuplas en orden de la consulta:
            juego = {
                "juegoID": f[0],
                "usuarioid": f[1],
                "titulo": f[2],
                "descripcion": f[3],
                "genero": f[4],
                "precio": float(f[5]) if f[5] is not None else 0.0,
                "portada": f[6],            # nombre de archivo (o NULL)
                "plataforma": f[7],
                "horasjugadas": f[8],
                "estado": f[9],
                "fechapublicacion": str(f[10]) if f[10] is not None else None,
                "archivo_instalador": f[11],
                "tamano_archivo": f[12]
            }
            juegos.append(juego)

        return jsonify({"exito": True, "juegos": juegos}), 200

    except Exception as ex:
        print("ERROR en GET /admin/juegos:", ex)
        return jsonify({"exito": False, "mensaje": f"Error en el servidor: {ex}"}), 500


@app.route('/api/mis-juegos', methods=['GET'])
def mis_juegos():
    try:
        usuarioid = request.args.get('usuarioid', type=int)
        if not usuarioid:
            return jsonify({'exito': False, 'mensaje': 'Falta usuarioid'}), 400

        cursor = mysql.connection.cursor()
        sql = """
            SELECT 
                j.juegoID,
                j.titulo,
                j.descripcion,
                j.genero,
                j.portada,
                j.archivo_instalador,
                j.tamano_archivo,
                j.horasjugadas,
                j.plataforma,
                j.precio,
                c.fechacompra
            FROM compras c
            JOIN juegos j ON c.juegoID = j.juegoID
            WHERE c.usuarioid = %s
            ORDER BY c.fechacompra DESC
        """
        cursor.execute(sql, (usuarioid,))
        filas = cursor.fetchall()
        cursor.close()

        juegos = []
        for fila in filas:
            juegos.append({
                'juegoID':            fila[0],
                'titulo':             fila[1],
                'descripcion':        fila[2],
                'genero':             fila[3],
                'portada':            fila[4],
                'archivo_instalador': fila[5],
                'tamano_archivo':     int(fila[6]) if fila[6] is not None else 0,
                'horasjugadas':       fila[7] if fila[7] is not None else 0,
                'plataforma':         fila[8],
                'precio':             float(fila[9]),
                'fecha_compra':       str(fila[10])
            })

        return jsonify({'exito': True, 'juegos': juegos}), 200

    except Exception as ex:
        print("ERROR en /api/mis-juegos:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error en el servidor: {ex}'}), 500


@app.route('/api/carrito/procesar', methods=['POST'])
def procesar_carrito():
    try:
        data = request.get_json()
        print("Data recibida en /api/carrito/procesar:", data)

        usuarioid = data.get('usuarioid')
        total = data.get('total')
        items = data.get('items', [])

        if not usuarioid or not isinstance(items, list) or len(items) == 0:
            return jsonify({'exito': False, 'mensaje': 'Datos inválidos en la petición'}), 400

        cursor = mysql.connection.cursor()

        # 1) Leer saldo
        sql_saldo = "SELECT saldo FROM usuarios WHERE usuarioid = %s"
        cursor.execute(sql_saldo, (usuarioid,))
        row = cursor.fetchone()

        if not row:
            cursor.close()
            return jsonify({'exito': False, 'mensaje': 'Usuario no encontrado'}), 404

        saldo_actual = float(row[0])

        if saldo_actual < float(total):
            cursor.close()
            return jsonify({
                'exito': False,
                'mensaje': 'Saldo insuficiente para realizar la compra'
            }), 400

        # --- Prevención de compras duplicadas ---
        # Si alguno de los items tiene `juegoID`, verificar si el usuario ya lo compró
        try:
            for item in items:
                juego_id_check = item.get('juegoID')
                if juego_id_check:
                    cursor.execute("SELECT COUNT(1) FROM compras WHERE usuarioid=%s AND juegoID=%s AND estado='pagado'",
                                   (usuarioid, juego_id_check))
                    existe = cursor.fetchone()
                    if existe and existe[0] > 0:
                        cursor.close()
                        msg = f'El usuario {usuarioid} ya compró el juego {juego_id_check} anteriormente.'
                        print(f"[carrito/procesar] Compra duplicada detectada: {msg}")
                        return jsonify({'exito': False, 'mensaje': msg}), 400
        except Exception as e:
            print(f"[carrito/procesar] Error comprobando duplicados: {e}")
            # no abortamos aquí, seguimos; la inserción tendrá su propio manejo

        # 2) Descontar saldo
        nuevo_saldo = saldo_actual - float(total)
        sql_update_saldo = "UPDATE usuarios SET saldo = %s WHERE usuarioid = %s"
        cursor.execute(sql_update_saldo, (nuevo_saldo, usuarioid))

        # 3) Insertar en compras (uno por item)
        # Intentar insertar con juegoID, si falla (columna no existe), insertar sin juegoID
        sql_insert_compra_con_juego = """
            INSERT INTO compras (usuarioid, juegoID, nombreproducto, descripción, precio, divisa, fechacompra, estado)
            VALUES (%s, %s, %s, %s, %s, %s, NOW(), %s)
        """

        sql_insert_compra_sin_juego = """
            INSERT INTO compras (usuarioid, nombreproducto, descripción, precio, divisa, fechacompra, estado)
            VALUES (%s, %s, %s, %s, %s, NOW(), %s)
        """

        for item in items:
            juego_id = item.get('juegoID')
            titulo = item.get('titulo', 'Juego sin nombre')
            descripcion = item.get('descripcion', '')
            precio = float(item.get('precio', 0))

            # Si se proporcionó un juegoID válido, insertamos con juegoID
            if juego_id:
                try:
                    cursor.execute(
                        sql_insert_compra_con_juego,
                        (usuarioid, juego_id, titulo, descripcion, precio, 'MXN', 'pagado')
                    )
                except Exception as e:
                    # Si falla por cualquier motivo al insertar con juegoID, intentar sin él
                    print(f"Warning: fallo insert con juegoID ({e}), intentando sin juegoID")
                    cursor.execute(
                        sql_insert_compra_sin_juego,
                        (usuarioid, titulo, descripcion, precio, 'MXN', 'pagado')
                    )
            else:
                cursor.execute(
                    sql_insert_compra_sin_juego,
                    (usuarioid, titulo, descripcion, precio, 'MXN', 'pagado')
                )

        mysql.connection.commit()
        cursor.close()

        return jsonify({
            'exito': True,
            'mensaje': 'Compra procesada correctamente',
            'nuevo_saldo': nuevo_saldo
        }), 200

    except Exception as ex:
        print("ERROR en /api/carrito/procesar:", ex)
        traceback.print_exc()
        mysql.connection.rollback()
        cursor.close()
        return jsonify({'exito': False, 'mensaje': f'Error en el servidor: {str(ex)}'}), 500


# Endpoints para descargar/jugar (local storage only)

@app.route('/api/juego/descargar/<int:juego_id>', methods=['GET'])
def descargar_juego(juego_id):
    """
    Descarga un juego desde el almacenamiento local (carpeta externa gestionada por storage_service).
    Acepta tanto `juegoID` como `comprasID` (resuelve compras->juego si es necesario).
    """
    try:
        cursor = mysql.connection.cursor()
        cursor.execute(
            "SELECT archivo_instalador, titulo FROM juegos WHERE juegoID = %s",
            (juego_id,)
        )
        resultado = cursor.fetchone()
        cursor.close()

        # Si no encontramos por juegoID, intentar resolver comprasID -> juegoID
        if not resultado:
            try:
                cur2 = mysql.connection.cursor()
                cur2.execute("SELECT juegoID FROM compras WHERE comprasID = %s", (juego_id,))
                fila_compra = cur2.fetchone()
                if fila_compra and fila_compra[0]:
                    juego_real_id = fila_compra[0]
                    cur2.execute("SELECT archivo_instalador, titulo FROM juegos WHERE juegoID = %s", (juego_real_id,))
                    resultado = cur2.fetchone()
                cur2.close()
            except Exception as e:
                print(f"Error buscando compra->juegoID: {e}")

        if not resultado:
            return jsonify({'exito': False, 'mensaje': 'Juego no encontrado'}), 404

        archivo_local, titulo = resultado

        if archivo_local:
            ruta_archivo = storage_service.obtener_ruta_archivo(archivo_local)
            if ruta_archivo and os.path.exists(ruta_archivo):
                print(f"📥 Descarga desde local (externa): {titulo} -> {ruta_archivo}")
                return send_file(ruta_archivo, as_attachment=True)

        return jsonify({'exito': False, 'mensaje': 'No se encontró el archivo del juego'}), 404

    except Exception as ex:
        print(f"ERROR en /api/juego/descargar: {ex}")
        return jsonify({'exito': False, 'mensaje': f'Error: {ex}'}), 500


@app.route('/api/juego/jugar/<int:juego_id>', methods=['GET'])
def jugar_juego(juego_id):
    """
    Ejecuta un juego directamente (descomprimir si es ZIP y ejecutar EXE).
    Para juegos Unity: si es ZIP lo descomprime en C:\JuegosLevelUp\extraidos\
    y encuentra el .exe para ejecutarlo.
    """
    try:
        cursor = mysql.connection.cursor()
        cursor.execute(
            "SELECT archivo_instalador, titulo FROM juegos WHERE juegoID = %s",
            (juego_id,)
        )
        resultado = cursor.fetchone()
        cursor.close()

        # Intentar resolver comprasID -> juegoID si hace falta
        if not resultado:
            try:
                cur2 = mysql.connection.cursor()
                cur2.execute("SELECT juegoID FROM compras WHERE comprasID = %s", (juego_id,))
                fila_compra = cur2.fetchone()
                if fila_compra and fila_compra[0]:
                    juego_real_id = fila_compra[0]
                    cur2.execute("SELECT archivo_instalador, titulo FROM juegos WHERE juegoID = %s", (juego_real_id,))
                    resultado = cur2.fetchone()
                cur2.close()
            except Exception as e:
                print(f"Error buscando compra->juegoID: {e}")

        if not resultado:
            return jsonify({'exito': False, 'mensaje': 'Juego no encontrado'}), 404

        archivo_local, titulo = resultado

        if not archivo_local:
            return jsonify({'exito': False, 'mensaje': 'No se encontró el archivo del juego'}), 404

        ruta_archivo = storage_service.obtener_ruta_archivo(archivo_local)
        if not ruta_archivo or not os.path.exists(ruta_archivo):
            return jsonify({'exito': False, 'mensaje': 'El archivo del juego no existe en el almacenamiento'}), 404

        # ===== PROCESAR SEGÚN TIPO DE ARCHIVO =====
        ext = os.path.splitext(archivo_local)[1].lower()

        # Si es ZIP: descomprimir y buscar EXE
        if ext == '.zip':
            import zipfile
            import subprocess
            
            # Carpeta para extraer
            carpeta_extraidos = os.path.join(storage_service.carpeta_juegos, 'extraidos')
            os.makedirs(carpeta_extraidos, exist_ok=True)
            
            nombre_sin_ext = os.path.splitext(archivo_local)[0]
            carpeta_juego = os.path.join(carpeta_extraidos, nombre_sin_ext)
            
            # Si ya existe extraído, usarlo; sino extraer
            if not os.path.exists(carpeta_juego):
                print(f"📦 Descomprimiendo {archivo_local} a {carpeta_juego}...")
                try:
                    with zipfile.ZipFile(ruta_archivo, 'r') as zip_ref:
                        zip_ref.extractall(carpeta_juego)
                    print(f"✅ Descomprimido correctamente")
                except Exception as e:
                    print(f"❌ Error descomprimiendo: {e}")
                    return jsonify({'exito': False, 'mensaje': f'Error descomprimiendo: {e}'}), 500
            else:
                print(f"✅ Carpeta ya existe: {carpeta_juego}")
            
            # Buscar el primer .exe en la carpeta extraída
            exe_path = None
            for root, dirs, files in os.walk(carpeta_juego):
                for file in files:
                    if file.lower().endswith('.exe'):
                        exe_path = os.path.join(root, file)
                        break
                if exe_path:
                    break
            
            if not exe_path:
                return jsonify({
                    'exito': False,
                    'mensaje': 'No se encontró archivo .exe en el ZIP'
                }), 400
            
            # Intentar ejecutar el EXE
            try:
                print(f"▶️ Ejecutando: {exe_path}")
                subprocess.Popen([exe_path], cwd=os.path.dirname(exe_path))
                return jsonify({
                    'exito': True,
                    'mensaje': f'Juego {titulo} iniciado correctamente',
                    'tipo': 'zip',
                    'exe_ejecutado': exe_path
                }), 200
            except Exception as e:
                print(f"❌ Error ejecutando EXE: {e}")
                return jsonify({
                    'exito': False,
                    'mensaje': f'Error ejecutando el juego: {e}'
                }), 500

        # Si es EXE: ejecutar directamente
        elif ext == '.exe':
            try:
                import subprocess
                print(f"▶️ Ejecutando EXE: {ruta_archivo}")
                subprocess.Popen([ruta_archivo], cwd=os.path.dirname(ruta_archivo))
                return jsonify({
                    'exito': True,
                    'mensaje': f'Juego {titulo} iniciado correctamente',
                    'tipo': 'exe',
                    'exe_ejecutado': ruta_archivo
                }), 200
            except Exception as e:
                print(f"❌ Error ejecutando EXE: {e}")
                return jsonify({
                    'exito': False,
                    'mensaje': f'Error ejecutando el juego: {e}'
                }), 500

        else:
            return jsonify({
                'exito': False,
                'mensaje': f'Tipo de archivo no soportado: {ext}'
            }), 400

    except Exception as ex:
        print(f"ERROR en /api/juego/jugar: {ex}")
        traceback.print_exc()
        return jsonify({'exito': False, 'mensaje': f'Error: {ex}'}), 500


# ===================== ENDPOINTS ADMIN - COMPRAS =====================

@app.route('/admin/compras', methods=['GET'])
def obtener_compras_admin():
    """
    Obtiene todas las compras del sistema (o de un usuario específico si se proporciona usuarioid)
    """
    try:
        usuarioid = request.args.get('usuarioid', type=int)
        
        cursor = mysql.connection.cursor()
        
        if usuarioid:
            # Compras de un usuario específico
            sql = """
                SELECT 
                    c.comprasID,
                    c.usuarioid,
                    c.juegoID,
                    c.nombreproducto,
                    c.descripción,
                    c.precio,
                    c.divisa,
                    c.fechacompra,
                    c.estado,
                    u.username,
                    u.email
                FROM compras c
                LEFT JOIN usuarios u ON c.usuarioid = u.usuarioid
                WHERE c.usuarioid = %s
                ORDER BY c.fechacompra DESC
            """
            cursor.execute(sql, (usuarioid,))
        else:
            # Todas las compras
            sql = """
                SELECT 
                    c.comprasID,
                    c.usuarioid,
                    c.juegoID,
                    c.nombreproducto,
                    c.descripción,
                    c.precio,
                    c.divisa,
                    c.fechacompra,
                    c.estado,
                    u.username,
                    u.email
                FROM compras c
                LEFT JOIN usuarios u ON c.usuarioid = u.usuarioid
                ORDER BY c.fechacompra DESC
            """
            cursor.execute(sql)
        
        filas = cursor.fetchall()
        cursor.close()
        
        compras = []
        ingresos_totales = 0
        
        for fila in filas:
            precio = float(fila[5]) if fila[5] is not None else 0
            ingresos_totales += precio
            
            compras.append({
                'comprasID': fila[0],
                'usuarioid': fila[1],
                'juegoID': fila[2],
                'nombreproducto': fila[3],
                'descripción': fila[4],
                'precio': precio,
                'divisa': fila[6],
                'fechacompra': str(fila[7]) if fila[7] else None,
                'estado': fila[8],
                'username': fila[9],
                'email': fila[10]
            })
        
        # Calcular estadísticas
        completadas = len([c for c in compras if c['estado'] == 'pagado'])
        pendientes = len([c for c in compras if c['estado'] == 'pendiente'])
        procesando = len([c for c in compras if c['estado'] == 'procesando'])
        canceladas = len([c for c in compras if c['estado'] == 'cancelado'])
        
        return jsonify({
            'exito': True,
            'compras': compras,
            'estadisticas': {
                'total': len(compras),
                'completadas': completadas,
                'pendientes': pendientes,
                'procesando': procesando,
                'canceladas': canceladas,
                'ingresos_totales': ingresos_totales
            }
        }), 200
        
    except Exception as ex:
        print("ERROR en GET /admin/compras:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error en el servidor: {ex}'}), 500


@app.route('/admin/compras/<int:compras_id>', methods=['PUT'])
def actualizar_compra(compras_id):
    """
    Actualiza el estado de una compra
    """
    try:
        data = request.get_json()
        nuevo_estado = data.get('estado')
        
        if not nuevo_estado:
            return jsonify({'exito': False, 'mensaje': 'Falta el estado'}), 400
        
        cursor = mysql.connection.cursor()
        sql = "UPDATE compras SET estado = %s WHERE comprasID = %s"
        cursor.execute(sql, (nuevo_estado, compras_id))
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({
            'exito': True,
            'mensaje': 'Compra actualizada correctamente'
        }), 200
        
    except Exception as ex:
        print("ERROR en PUT /admin/compras/<id>:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error en el servidor: {ex}'}), 500


@app.route('/admin/compras/<int:compras_id>', methods=['DELETE'])
def eliminar_compra(compras_id):
    """
    Elimina una compra
    """
    try:
        cursor = mysql.connection.cursor()
        
        # Primero obtener la compra para devolver info
        cursor.execute("SELECT usuarioid, precio FROM compras WHERE comprasID = %s", (compras_id,))
        compra = cursor.fetchone()
        
        if not compra:
            cursor.close()
            return jsonify({'exito': False, 'mensaje': 'Compra no encontrada'}), 404
        
        usuarioid, precio = compra
        
        # Eliminar la compra
        sql = "DELETE FROM compras WHERE comprasID = %s"
        cursor.execute(sql, (compras_id,))
        mysql.connection.commit()
        
        # Si quieres, también devuelve el saldo al usuario
        # sql_reembolso = "UPDATE usuarios SET saldo = saldo + %s WHERE usuarioid = %s"
        # cursor.execute(sql_reembolso, (precio, usuarioid))
        # mysql.connection.commit()
        
        cursor.close()
        
        return jsonify({
            'exito': True,
            'mensaje': 'Compra eliminada correctamente'
        }), 200
        
    except Exception as ex:
        print("ERROR en DELETE /admin/compras/<id>:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error en el servidor: {ex}'}), 500


# ===================== ENDPOINTS SOCIAL - AMIGOS Y MENSAJES =====================

@app.route('/api/social/amigos/<int:usuarioid>', methods=['GET'])
def obtener_amigos(usuarioid):
    """
    Obtiene la lista de amigos de un usuario
    """
    try:
        cursor = mysql.connection.cursor()
        
        # Obtener amigos aceptados (en ambas direcciones)
        sql = """
            SELECT 
                CASE 
                    WHEN usuario1_id = %s THEN usuario2_id
                    ELSE usuario1_id
                END as amigo_id,
                u.username,
                u.avatar,
                u.nombre,
                COALESCE(eu.estado, 'offline') as estado,
                COALESCE(eu.juego_actual, '') as juego_actual
            FROM amigos a
            JOIN usuarios u ON (
                (a.usuario1_id = u.usuarioid AND a.usuario2_id = %s) OR
                (a.usuario2_id = u.usuarioid AND a.usuario1_id = %s)
            )
            LEFT JOIN estado_usuario eu ON u.usuarioid = eu.usuarioid
            WHERE a.estado = 'aceptado'
            ORDER BY eu.estado DESC, u.username ASC
        """
        cursor.execute(sql, (usuarioid, usuarioid, usuarioid))
        filas = cursor.fetchall()
        
        amigos = []
        for fila in filas:
            avatar_url = f'http://127.0.0.1:5000/uploads/{fila[2]}' if fila[2] else None
            amigos.append({
                'id': fila[0],
                'nombre': fila[3] or fila[1],
                'username': fila[1],
                'avatar': avatar_url,
                'estado': fila[4],
                'juego': fila[5] if fila[5] else 'Disponible'
            })
        
        cursor.close()
        
        return jsonify({
            'exito': True,
            'amigos': amigos
        }), 200
        
    except Exception as ex:
        print("ERROR en GET /api/social/amigos/<usuarioid>:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error: {ex}'}), 500


@app.route('/api/social/solicitudes/<int:usuarioid>', methods=['GET'])
def obtener_solicitudes_amistad(usuarioid):
    """
    Obtiene las solicitudes de amistad pendientes de un usuario
    """
    try:
        cursor = mysql.connection.cursor()
        
        sql = """
            SELECT 
                a.amistad_id,
                u.usuarioid,
                u.username,
                u.nombre,
                u.avatar,
                a.fecha_solicitud
            FROM amigos a
            JOIN usuarios u ON a.usuario1_id = u.usuarioid
            WHERE a.usuario2_id = %s AND a.estado = 'pendiente'
            ORDER BY a.fecha_solicitud DESC
        """
        cursor.execute(sql, (usuarioid,))
        filas = cursor.fetchall()
        
        solicitudes = []
        for fila in filas:
            avatar_url = f'http://127.0.0.1:5000/uploads/{fila[4]}' if fila[4] else None
            solicitudes.append({
                'amistad_id': fila[0],
                'usuarioid': fila[1],
                'username': fila[2],
                'nombre': fila[3],
                'avatar': avatar_url,
                'fecha_solicitud': str(fila[5])
            })
        
        cursor.close()
        
        return jsonify({
            'exito': True,
            'solicitudes': solicitudes
        }), 200
        
    except Exception as ex:
        print("ERROR en GET /api/social/solicitudes/<usuarioid>:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error: {ex}'}), 500


@app.route('/api/social/buscar', methods=['GET'])
def buscar_usuarios():
    """
    Busca usuarios por nombre o username
    """
    try:
        termino = request.args.get('q', '').lower().strip()
        usuario_actual = request.args.get('usuarioid', type=int)
        
        if not termino or len(termino) < 2:
            return jsonify({'exito': False, 'mensaje': 'Término de búsqueda muy corto'}), 400
        
        cursor = mysql.connection.cursor()
        
        sql = """
            SELECT 
                usuarioid,
                username,
                nombre,
                avatar
            FROM usuarios
            WHERE (username LIKE %s OR nombre LIKE %s)
            AND usuarioid != %s
            LIMIT 10
        """
        termino_busqueda = f'%{termino}%'
        cursor.execute(sql, (termino_busqueda, termino_busqueda, usuario_actual))
        filas = cursor.fetchall()
        
        usuarios = []
        for fila in filas:
            avatar_url = f'http://127.0.0.1:5000/uploads/{fila[3]}' if fila[3] else None
            usuarios.append({
                'usuarioid': fila[0],
                'username': fila[1],
                'nombre': fila[2],
                'avatar': avatar_url
            })
        
        cursor.close()
        
        return jsonify({
            'exito': True,
            'usuarios': usuarios
        }), 200
        
    except Exception as ex:
        print("ERROR en GET /api/social/buscar:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error: {ex}'}), 500


@app.route('/api/social/agregar-amigo', methods=['POST'])
def agregar_amigo():
    """
    Envía solicitud de amistad
    """
    try:
        data = request.get_json()
        usuario_actual = data.get('usuario_actual')
        usuario_destino = data.get('usuario_destino')
        
        if not usuario_actual or not usuario_destino:
            return jsonify({'exito': False, 'mensaje': 'Datos incompletos'}), 400
        
        if usuario_actual == usuario_destino:
            return jsonify({'exito': False, 'mensaje': 'No puedes agregarte a ti mismo'}), 400
        
        cursor = mysql.connection.cursor()
        
        # Verificar que no ya exista amistad
        sql_check = """
            SELECT amistad_id FROM amigos
            WHERE (usuario1_id = %s AND usuario2_id = %s)
            OR (usuario1_id = %s AND usuario2_id = %s)
        """
        cursor.execute(sql_check, (usuario_actual, usuario_destino, usuario_destino, usuario_actual))
        existe = cursor.fetchone()
        
        if existe:
            cursor.close()
            return jsonify({'exito': False, 'mensaje': 'Ya existe solicitud o amistad con este usuario'}), 400
        
        # Crear nueva solicitud
        sql_insert = """
            INSERT INTO amigos (usuario1_id, usuario2_id, estado)
            VALUES (%s, %s, 'pendiente')
        """
        cursor.execute(sql_insert, (usuario_actual, usuario_destino))
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({
            'exito': True,
            'mensaje': 'Solicitud de amistad enviada'
        }), 201
        
    except Exception as ex:
        print("ERROR en POST /api/social/agregar-amigo:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error: {ex}'}), 500


@app.route('/api/social/aceptar-amistad/<int:amistad_id>', methods=['POST'])
def aceptar_amistad(amistad_id):
    """
    Acepta una solicitud de amistad
    """
    try:
        cursor = mysql.connection.cursor()
        
        sql = """
            UPDATE amigos
            SET estado = 'aceptado', fecha_aceptacion = NOW()
            WHERE amistad_id = %s
        """
        cursor.execute(sql, (amistad_id,))
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({
            'exito': True,
            'mensaje': 'Amistad aceptada'
        }), 200
        
    except Exception as ex:
        print("ERROR en POST /api/social/aceptar-amistad:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error: {ex}'}), 500


@app.route('/api/social/rechazar-amistad/<int:amistad_id>', methods=['POST'])
def rechazar_amistad(amistad_id):
    """
    Rechaza una solicitud de amistad
    """
    try:
        cursor = mysql.connection.cursor()
        
        sql = "DELETE FROM amigos WHERE amistad_id = %s"
        cursor.execute(sql, (amistad_id,))
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({
            'exito': True,
            'mensaje': 'Solicitud rechazada'
        }), 200
        
    except Exception as ex:
        print("ERROR en POST /api/social/rechazar-amistad:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error: {ex}'}), 500


@app.route('/api/social/eliminar-amigo/<int:amigo_id>', methods=['POST'])
def eliminar_amigo(amigo_id):
    """
    Elimina a un amigo
    """
    try:
        usuario_actual = request.get_json().get('usuario_actual')
        
        cursor = mysql.connection.cursor()
        
        sql = """
            DELETE FROM amigos
            WHERE (usuario1_id = %s AND usuario2_id = %s)
            OR (usuario1_id = %s AND usuario2_id = %s)
        """
        cursor.execute(sql, (usuario_actual, amigo_id, amigo_id, usuario_actual))
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({
            'exito': True,
            'mensaje': 'Amigo eliminado'
        }), 200
        
    except Exception as ex:
        print("ERROR en POST /api/social/eliminar-amigo:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error: {ex}'}), 500


@app.route('/api/social/mensajes/<int:usuario1>/<int:usuario2>', methods=['GET'])
def obtener_mensajes(usuario1, usuario2):
    """
    Obtiene los mensajes entre dos usuarios
    """
    try:
        cursor = mysql.connection.cursor()
        
        sql = """
            SELECT 
                mensaje_id,
                remitente_id,
                destinatario_id,
                contenido,
                fecha_envio,
                leido
            FROM mensajes
            WHERE (remitente_id = %s AND destinatario_id = %s)
            OR (remitente_id = %s AND destinatario_id = %s)
            ORDER BY fecha_envio ASC
            LIMIT 50
        """
        cursor.execute(sql, (usuario1, usuario2, usuario2, usuario1))
        filas = cursor.fetchall()
        
        mensajes = []
        for fila in filas:
            mensajes.append({
                'mensaje_id': fila[0],
                'remitente_id': fila[1],
                'destinatario_id': fila[2],
                'contenido': fila[3],
                'fecha_envio': str(fila[4]),
                'leido': fila[5]
            })
        
        # Marcar como leído
        sql_update = """
            UPDATE mensajes
            SET leido = TRUE, fecha_lectura = NOW()
            WHERE (remitente_id = %s AND destinatario_id = %s)
            AND leido = FALSE
        """
        cursor.execute(sql_update, (usuario2, usuario1))
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({
            'exito': True,
            'mensajes': mensajes
        }), 200
        
    except Exception as ex:
        print("ERROR en GET /api/social/mensajes:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error: {ex}'}), 500


@app.route('/api/social/historial-completo', methods=['GET'])
def obtener_historial_completo():
    """
    Obtiene todos los mensajes del sistema (para admin)
    """
    try:
        cursor = mysql.connection.cursor()
        
        sql = """
            SELECT 
                m.mensaje_id,
                m.remitente_id,
                u1.username as remitente_username,
                m.destinatario_id,
                u2.username as destinatario_username,
                m.contenido,
                m.fecha_envio,
                m.leido,
                COALESCE(m.reportado, 0) as reportado
            FROM mensajes m
            JOIN usuarios u1 ON m.remitente_id = u1.usuarioid
            JOIN usuarios u2 ON m.destinatario_id = u2.usuarioid
            ORDER BY m.fecha_envio DESC
            LIMIT 500
        """
        cursor.execute(sql)
        filas = cursor.fetchall()
        
        mensajes = []
        for fila in filas:
            mensajes.append({
                'mensaje_id': fila[0],
                'remitente_id': fila[1],
                'remitente_username': fila[2],
                'destinatario_id': fila[3],
                'destinatario_username': fila[4],
                'contenido': fila[5],
                'fecha_envio': str(fila[6]),
                'leido': fila[7],
                'reportado': fila[8]
            })
        
        cursor.close()
        
        return jsonify({
            'exito': True,
            'mensajes': mensajes
        }), 200
        
    except Exception as ex:
        print("ERROR en GET /api/social/historial-completo:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error: {ex}'}), 500


@app.route('/api/social/enviar-mensaje', methods=['POST'])
def enviar_mensaje():
    """
    Envía un mensaje a otro usuario
    """
    try:
        data = request.get_json()
        remitente = data.get('remitente_id')
        destinatario = data.get('destinatario_id')
        contenido = data.get('contenido', '').strip()
        
        if not remitente or not destinatario or not contenido:
            return jsonify({'exito': False, 'mensaje': 'Datos incompletos'}), 400
        
        if len(contenido) > 500:
            return jsonify({'exito': False, 'mensaje': 'Mensaje demasiado largo'}), 400
        
        cursor = mysql.connection.cursor()
        
        sql = """
            INSERT INTO mensajes (remitente_id, destinatario_id, contenido)
            VALUES (%s, %s, %s)
        """
        cursor.execute(sql, (remitente, destinatario, contenido))
        mysql.connection.commit()
        
        mensaje_id = cursor.lastrowid
        cursor.close()
        
        return jsonify({
            'exito': True,
            'mensaje_id': mensaje_id,
            'mensaje': 'Mensaje enviado'
        }), 201
        
    except Exception as ex:
        print("ERROR en POST /api/social/enviar-mensaje:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error: {ex}'}), 500


@app.route('/api/social/estado', methods=['POST'])
def actualizar_estado_usuario():
    """
    Actualiza el estado online/offline del usuario
    """
    try:
        data = request.get_json()
        usuarioid = data.get('usuarioid')
        estado = data.get('estado', 'offline')  # online, offline, jugando
        juego_actual = data.get('juego_actual', None)
        
        if not usuarioid:
            return jsonify({'exito': False, 'mensaje': 'Falta usuarioid'}), 400
        
        cursor = mysql.connection.cursor()
        
        # Insertar o actualizar estado
        sql = """
            INSERT INTO estado_usuario (usuarioid, estado, juego_actual)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE
            estado = %s,
            juego_actual = %s,
            ultima_actividad = NOW()
        """
        cursor.execute(sql, (usuarioid, estado, juego_actual, estado, juego_actual))
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({
            'exito': True,
            'mensaje': 'Estado actualizado'
        }), 200
        
    except Exception as ex:
        print("ERROR en POST /api/social/estado:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error: {ex}'}), 500


# ===================== ENDPOINTS RESEÑAS =====================

@app.route('/api/resenas/<int:juegoID>', methods=['GET'])
def obtener_resenas_juego(juegoID):
    """
    Obtiene todas las reseñas publicadas de un juego
    """
    try:
        cursor = mysql.connection.cursor()
        
        
        sql = """
            SELECT 
                r.resenaID,
                r.usuarioid,
                u.username,
                u.avatar,
                r.titulo,
                r.contenido,
                r.rating,
                r.fecha_publicacion,
                r.util,
                r.reportes
            FROM resenas r
            JOIN usuarios u ON r.usuarioid = u.usuarioid
            WHERE r.juegoID = %s AND r.estado = 'publicada'
            ORDER BY r.util DESC, r.fecha_publicacion DESC
        """
        cursor.execute(sql, (juegoID,))
        filas = cursor.fetchall()
        
        resenas = []
        for fila in filas:
            avatar_url = f'http://127.0.0.1:5000/uploads/{fila[3]}' if fila[3] else None
            resenas.append({
                'resenaID': fila[0],
                'usuarioid': fila[1],
                'username': fila[2],
                'avatar': avatar_url,
                'titulo': fila[4],
                'contenido': fila[5],
                'rating': fila[6],
                'fecha_publicacion': str(fila[7]),
                'util': fila[8],
                'reportes': fila[9]
            })
        
        cursor.close()
        
        return jsonify({
            'exito': True,
            'resenas': resenas
        }), 200
        
    except Exception as ex:
        print("ERROR en GET /api/resenas/<juegoID>:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error: {ex}'}), 500


@app.route('/api/resenas/rating/<int:juegoID>', methods=['GET'])
def obtener_rating_juego(juegoID):
    """
    Obtiene el rating promedio y cantidad de reseñas de un juego
    """
    try:
        cursor = mysql.connection.cursor()
        
        sql = """
            SELECT 
                COUNT(*) as total_resenas,
                AVG(rating) as rating_promedio
            FROM resenas
            WHERE juegoID = %s AND estado = 'publicada'
        """
        cursor.execute(sql, (juegoID,))
        resultado = cursor.fetchone()
        cursor.close()
        
        total = resultado[0] if resultado[0] else 0
        promedio = round(resultado[1], 1) if resultado[1] else 0
        
        return jsonify({
            'exito': True,
            'total_resenas': total,
            'rating_promedio': promedio
        }), 200
        
    except Exception as ex:
        print("ERROR en GET /api/resenas/rating/<juegoID>:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error: {ex}'}), 500


@app.route('/api/resenas/crear', methods=['POST'])
def crear_resena():
    """
    Crea una nueva reseña
    """
    try:
        data = request.get_json()
        juegoID = data.get('juegoID')
        usuarioid = data.get('usuarioid')
        titulo = data.get('titulo', '').strip()
        contenido = data.get('contenido', '').strip()
        rating = data.get('rating')
        
        if not all([juegoID, usuarioid, titulo, contenido, rating]):
            return jsonify({'exito': False, 'mensaje': 'Datos incompletos'}), 400
        
        if not (1 <= rating <= 5):
            return jsonify({'exito': False, 'mensaje': 'Rating debe estar entre 1 y 5'}), 400
        
        if len(titulo) > 255 or len(contenido) > 5000:
            return jsonify({'exito': False, 'mensaje': 'Texto demasiado largo'}), 400
        
        cursor = mysql.connection.cursor()
        
        # Verificar que el usuario tenga el juego comprado
        sql_check = "SELECT comprasID FROM compras WHERE usuarioid = %s AND juegoID = %s"
        cursor.execute(sql_check, (usuarioid, juegoID))
        compra = cursor.fetchone()
        
        if not compra:
            cursor.close()
            return jsonify({'exito': False, 'mensaje': 'No has comprado este juego'}), 403
        
        # Verificar que no haya ya una reseña del usuario para este juego
        sql_check2 = "SELECT resenaID FROM resenas WHERE juegoID = %s AND usuarioid = %s"
        cursor.execute(sql_check2, (juegoID, usuarioid))
        resena_existente = cursor.fetchone()
        
        if resena_existente:
            cursor.close()
            return jsonify({'exito': False, 'mensaje': 'Ya has escrito una reseña para este juego'}), 409
        
        # Crear reseña
        sql = """
            INSERT INTO resenas (juegoID, usuarioid, titulo, contenido, rating, estado)
            VALUES (%s, %s, %s, %s, %s, 'pendiente')
        """
        cursor.execute(sql, (juegoID, usuarioid, titulo, contenido, rating))
        mysql.connection.commit()
        
        resena_id = cursor.lastrowid
        cursor.close()
        
        return jsonify({
            'exito': True,
            'resenaID': resena_id,
            'mensaje': 'Reseña creada y pendiente de aprobación'
        }), 201
        
    except Exception as ex:
        print("ERROR en POST /api/resenas/crear:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error: {ex}'}), 500


@app.route('/api/resenas/<int:resenaID>/votar-util', methods=['POST'])
def votar_util_resena(resenaID):
    """
    Incrementa el contador de útil en una reseña
    """
    try:
        cursor = mysql.connection.cursor()
        
        sql = "UPDATE resenas SET util = util + 1 WHERE resenaID = %s"
        cursor.execute(sql, (resenaID,))
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({
            'exito': True,
            'mensaje': 'Voto registrado'
        }), 200
        
    except Exception as ex:
        print("ERROR en POST /api/resenas/<resenaID>/votar-util:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error: {ex}'}), 500


@app.route('/api/admin/resenas', methods=['GET'])
def obtener_resenas_admin():
    """
    Obtiene todas las reseñas (para administrador)
    """
    try:
        estado = request.args.get('estado', 'todas')
        
        cursor = mysql.connection.cursor()
        
        if estado == 'todas':
            sql = """
                SELECT 
                    r.resenaID,
                    r.juegoID,
                    j.titulo as nombre_juego,
                    r.usuarioid,
                    u.username,
                    r.titulo,
                    r.contenido,
                    r.rating,
                    r.estado,
                    r.fecha_creacion,
                    r.fecha_publicacion,
                    r.util,
                    r.reportes
                FROM resenas r
                JOIN juegos j ON r.juegoID = j.juegoID
                JOIN usuarios u ON r.usuarioid = u.usuarioid
                ORDER BY r.fecha_creacion DESC
            """
            cursor.execute(sql)
        else:
            sql = """
                SELECT 
                    r.resenaID,
                    r.juegoID,
                    j.titulo as nombre_juego,
                    r.usuarioid,
                    u.username,
                    r.titulo,
                    r.contenido,
                    r.rating,
                    r.estado,
                    r.fecha_creacion,
                    r.fecha_publicacion,
                    r.util,
                    r.reportes
                FROM resenas r
                JOIN juegos j ON r.juegoID = j.juegoID
                JOIN usuarios u ON r.usuarioid = u.usuarioid
                WHERE r.estado = %s
                ORDER BY r.fecha_creacion DESC
            """
            cursor.execute(sql, (estado,))
        
        filas = cursor.fetchall()
        
        resenas = []
        for fila in filas:
            resenas.append({
                'resenaID': fila[0],
                'juegoID': fila[1],
                'nombre_juego': fila[2],
                'usuarioid': fila[3],
                'username': fila[4],
                'titulo': fila[5],
                'contenido': fila[6],
                'rating': fila[7],
                'estado': fila[8],
                'fecha_creacion': str(fila[9]),
                'fecha_publicacion': str(fila[10]) if fila[10] else None,
                'util': fila[11],
                'reportes': fila[12]
            })
        
        cursor.close()
        
        return jsonify({
            'exito': True,
            'resenas': resenas
        }), 200
        
    except Exception as ex:
        print("ERROR en GET /api/admin/resenas:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error: {ex}'}), 500


@app.route('/api/admin/resenas/<int:resenaID>/aprobar', methods=['POST'])
def aprobar_resena(resenaID):
    """
    Aprueba una reseña para publicarla
    """
    try:
        cursor = mysql.connection.cursor()
        
        sql = """
            UPDATE resenas
            SET estado = 'publicada', fecha_publicacion = NOW()
            WHERE resenaID = %s
        """
        cursor.execute(sql, (resenaID,))
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({
            'exito': True,
            'mensaje': 'Reseña aprobada'
        }), 200
        
    except Exception as ex:
        print("ERROR en POST /api/admin/resenas/<resenaID>/aprobar:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error: {ex}'}), 500


@app.route('/api/admin/resenas/<int:resenaID>/rechazar', methods=['POST'])
def rechazar_resena(resenaID):
    """
    Rechaza una reseña
    """
    try:
        cursor = mysql.connection.cursor()
        
        sql = "UPDATE resenas SET estado = 'rechazada' WHERE resenaID = %s"
        cursor.execute(sql, (resenaID,))
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({
            'exito': True,
            'mensaje': 'Reseña rechazada'
        }), 200
        
    except Exception as ex:
        print("ERROR en POST /api/admin/resenas/<resenaID>/rechazar:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error: {ex}'}), 500


@app.route('/api/admin/resenas/<int:resenaID>/eliminar', methods=['DELETE'])
def eliminar_resena(resenaID):
    """
    Elimina una reseña
    """
    try:
        cursor = mysql.connection.cursor()
        
        sql = "DELETE FROM resenas WHERE resenaID = %s"
        cursor.execute(sql, (resenaID,))
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({
            'exito': True,
            'mensaje': 'Reseña eliminada'
        }), 200
        
    except Exception as ex:
        print("ERROR en DELETE /api/admin/resenas/<resenaID>/eliminar:", ex)
        return jsonify({'exito': False, 'mensaje': f'Error: {ex}'}), 500

@app.route('/noticias', methods=['GET'])
def obtener_noticias():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM noticias")
    data = cursor.fetchall()

    columnas = [col[0] for col in cursor.description]
    resultado = [dict(zip(columnas, fila)) for fila in data]

    cursor.close()
    return jsonify(resultado)


@app.route('/noticias', methods=['POST'])
def crear_noticia():
    datos = request.json
    cursor = mysql.connection.cursor()

    sql = """
        INSERT INTO noticias (titulo, tipo, fecha, autor, descripcion, imagen)
        VALUES (%s, %s, %s, %s, %s, %s)
    """

    valores = (
        datos['titulo'],
        datos['tipo'],
        datos['fecha'],
        datos['autor'],
        datos['descripcion'],
        datos['imagen']  
    )

    cursor.execute(sql, valores)
    mysql.connection.commit()

    cursor.close()
    return jsonify({ "exito": True, "mensaje": "Noticia creada correctamente" })


@app.route('/noticias/<int:noticiaid>', methods=['PUT'])
def editar_noticia(noticiaid):
    datos = request.json
    cursor = mysql.connection.cursor()

    sql = """
        UPDATE noticias
        SET titulo=%s, tipo=%s, fecha=%s, autor=%s,
            descripcion=%s, imagen=%s
        WHERE noticiaid=%s
    """

    valores = (
        datos['titulo'],
        datos['tipo'],
        datos['fecha'],
        datos['autor'],
        datos['descripcion'],
        datos['imagen'],
        noticiaid
    )

    cursor.execute(sql, valores)
    mysql.connection.commit()
    cursor.close()

    return jsonify({ "exito": True, "mensaje": "Noticia actualizada correctamente" })


@app.route('/noticias/<int:noticiaid>', methods=['DELETE'])
def eliminar_noticia(noticiaid):
    cursor = mysql.connection.cursor()

    cursor.execute("DELETE FROM noticias WHERE noticiaid=%s", (noticiaid,))
    mysql.connection.commit()

    cursor.close()
    return jsonify({ "exito": True, "mensaje": "Noticia eliminada" })


@app.route('/api/upload_news', methods=['POST'])
def upload_news():
    title = request.form.get("title")
    content = request.form.get("content")

    image = request.files.get("image")  # <-- NO JSON

    filename = None
    if image:
        filename = secure_filename(image.filename)
        image.save(os.path.join("static/uploads", filename))

    # aquí insertas a tu base de datos
    cursor = mysql.connection.cursor()
    cursor.execute("""
        INSERT INTO news (title, content, image)
        VALUES (%s, %s, %s)
    """, (title, content, filename))
    mysql.connection.commit()

    return jsonify({"status": "ok", "message": "Noticia guardada"})



@app.route('/even_actu', methods=['GET'])
def obtener_eventos():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM even_actu ORDER BY fecha ASC")
        data = cursor.fetchall()

        columnas = [col[0] for col in cursor.description]
        resultado = [dict(zip(columnas, fila)) for fila in data]

        cursor.close()
        return jsonify(resultado)

    except Exception as ex:
        print("ERROR en GET /eventos:", ex)
        return jsonify({'error': str(ex)}), 500


# ------------------------------------------
#  POST - Crear Evento (RECIBE FORM-DATA)
# ------------------------------------------
@app.route('/even_actu', methods=['POST'])
def crear_evento():
    try:
        titulo = request.form.get("titulo")
        tipo = request.form.get("tipo")
        fecha = request.form.get("fecha")
        autor = request.form.get("autor")
        descripcion = request.form.get("descripcion")
        destacado = request.form.get("destacado")
        estado = request.form.get("estado")

        imagen_file = request.files.get("imagen")
        imagen_base64 = None

        if imagen_file:
            import base64
            imagen_base64 = base64.b64encode(imagen_file.read()).decode('utf-8')

        cursor = mysql.connection.cursor()

        sql = """
            INSERT INTO even_actu 
            (titulo, tipo, fecha, autor, descripcion, destacado, estado, imagen)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """

        cursor.execute(sql, (
            titulo, tipo, fecha, autor,
            descripcion, destacado, estado, imagen_base64
        ))

        mysql.connection.commit()
        cursor.close()

        return jsonify({"exito": True})

    except Exception as ex:
        print("ERROR en POST /eventos:", ex)
        return jsonify({'error': str(ex)})  



# ------------------------------------------
#  PUT - Editar Evento (RECIBE FORM-DATA)
# ------------------------------------------
@app.route('/even_actu/<int:even_actu_id>', methods=['PUT'])
def editar_evento(even_actu_id):
    try:
        titulo = request.form.get("titulo")
        tipo = request.form.get("tipo")
        fecha = request.form.get("fecha")
        autor = request.form.get("autor")
        descripcion = request.form.get("descripcion")
        destacado = request.form.get("destacado")
        estado = request.form.get("estado")

        imagen_file = request.files.get("imagen")
        imagen_base64 = None

        cursor = mysql.connection.cursor()

        if imagen_file:
            imagen_base64 = base64.b64encode(imagen_file.read()).decode('utf-8')

            sql = """
                UPDATE even_actu
                SET titulo=%s, tipo=%s, fecha=%s, autor=%s,
                    descripcion=%s, destacado=%s, estado=%s, imagen=%s
                WHERE even_actu_id=%s
            """
            valores = (titulo, tipo, fecha, autor, descripcion, destacado, estado,
                    imagen_base64, even_actu_id)
        else:
            sql = """
                UPDATE even_actu
                SET titulo=%s, tipo=%s, fecha=%s, autor=%s,
                    descripcion=%s, destacado=%s, estado=%s
                WHERE even_actu_id=%s
            """
            valores = (titulo, tipo, fecha, autor, descripcion, destacado, estado,
                       even_actu_id)

        cursor.execute(sql, valores)
        mysql.connection.commit()
        cursor.close()

        return jsonify({"exito": True})

    except Exception as ex:
        print("ERROR en PUT /eventos:", ex)
        return jsonify({'error': str(ex)}), 500



# ------------------------------------------
#  DELETE
# ------------------------------------------
@app.route('/even_actu/<int:even_actu_id>', methods=['DELETE'])
def eliminar_evento(even_actu_id):
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("DELETE FROM even_actu WHERE even_actu_id=%s", (even_actu_id,))
        mysql.connection.commit()
        cursor.close()

        return jsonify({"exito": True, "mensaje": "Evento eliminado"})

    except Exception as ex:
        print("ERROR en DELETE /eventos:", ex)
        return jsonify({'error': str(ex)}), 500


@app.route('/newsletter', methods=['POST'])
def suscribirse_newsletter():
    try:
        correo = request.json.get('correo')
        if not correo:
            return jsonify({'error': 'Correo es requerido'}), 400

        cursor = mysql.connection.cursor()

        # Insertar correo, ignorando duplicados
        sql = "INSERT IGNORE INTO newsletter (correo) VALUES (%s)"
        cursor.execute(sql, (correo,))
        mysql.connection.commit()
        cursor.close()

        return jsonify({'exito': True, 'mensaje': 'Correo registrado correctamente'})

    except Exception as ex:
        print("ERROR en POST /newsletter:", ex)
        return jsonify({'error': str(ex)}), 500

def pagina_no_encontrada(error):
    return "<h1>Pagina no encontrada</h1>", 404

if __name__ == "__main__":
    app.register_error_handler(404, pagina_no_encontrada)
    app.run(host='0.0.0.0', port=5000, debug=True)
