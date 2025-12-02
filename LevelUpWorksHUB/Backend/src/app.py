from flask import Flask, request, jsonify, send_from_directory
from flask_mysqldb import MySQL
from flask_cors import CORS
from config import config
import random
from datetime import datetime
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

# Carpeta donde guardarás las portadas
PORTADAS_FOLDER = os.path.join(app.root_path, 'static', 'portadas')
os.makedirs(PORTADAS_FOLDER, exist_ok=True)

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
        saldo_bd    = datos[9]   # 👈 AQUÍ SE TOMA EL SALDO

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
            'biografia': biografia
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
                # Campos fake para que tu UI no truene:
                'estado': 'active',          # si no tienes columna, lo dejamos fijo
                'miembroDesde': '2024-01-01',
                'comprasTotales': 0,
                'gastoTotal': 0,
                'ultimoAcceso': '2024-01-01',
                'saldo': float(fila[9])

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


""" ---------------------NOTICIAS------------------------------------------ """

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


# ------------------------ GESTIÓN DE JUEGOS (ADMIN) --------------------------

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

        # ======= PORTADA (imagen) =======
        portada_filename = None
        if 'image' in request.files:
            imagen_file = request.files['image']
            if imagen_file and imagen_file.filename != '':
                import time, os
                from werkzeug.utils import secure_filename

                filename_seguro = secure_filename(imagen_file.filename)
                nombre_archivo_portada = f"{int(time.time())}_{filename_seguro}"

                ruta_carpeta_portadas = os.path.join(app.root_path, 'static', 'portadas')
                os.makedirs(ruta_carpeta_portadas, exist_ok=True)
                ruta_completa_portada = os.path.join(ruta_carpeta_portadas, nombre_archivo_portada)
                imagen_file.save(ruta_completa_portada)

                portada_filename = nombre_archivo_portada

        # ======= ARCHIVO DEL JUEGO (installer) =======
        archivo_instalador = None
        tamano_archivo = None

        if 'installer' in request.files:
            game_file = request.files['installer']
            if game_file and game_file.filename != '':
                import time, os
                from werkzeug.utils import secure_filename

                filename_seguro = secure_filename(game_file.filename)
                nombre_archivo_juego = f"{int(time.time())}_{filename_seguro}"

                ruta_carpeta_juegos = os.path.join(app.root_path, 'static', 'juegos')
                os.makedirs(ruta_carpeta_juegos, exist_ok=True)
                ruta_completa_juego = os.path.join(ruta_carpeta_juegos, nombre_archivo_juego)

                game_file.save(ruta_completa_juego)

                archivo_instalador = nombre_archivo_juego
                tamano_archivo = os.path.getsize(ruta_completa_juego)

        # ======= INSERT EN BD =======
        sql = """
            INSERT INTO juegos
            (usuarioid, titulo, genero, portada, plataforma, horasjugadas, fechapublicacion,
             precio, descripcion, archivo_instalador, tamano_archivo)
            VALUES (%s, %s, %s, %s, %s, %s, NOW(), %s, %s, %s, %s)
        """
        # por ahora usuarioid lo puedes poner fijo o null si tu BD lo permite
        usuarioid = 1  # TODO: luego lo cambias al admin logueado

        cursor.execute(sql, (
            usuarioid,
            title,
            genre,
            portada_filename,
            platform,
            0,                  # horasjugadas inicial = 0
            price_val,
            description,
            archivo_instalador,
            tamano_archivo
        ))
        mysql.connection.commit()

        nuevo_id = cursor.lastrowid

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
                import time, os
                from werkzeug.utils import secure_filename

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

from flask import request, jsonify

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

        # 2) Descontar saldo
        nuevo_saldo = saldo_actual - float(total)
        sql_update_saldo = "UPDATE usuarios SET saldo = %s WHERE usuarioid = %s"
        cursor.execute(sql_update_saldo, (nuevo_saldo, usuarioid))

        # 3) Insertar en compras (uno por item)
        sql_insert_compra = """
            INSERT INTO compras (usuarioid, nombreproducto, descripción, precio, divisa, fechacompra, estado)
            VALUES (%s, %s, %s, %s, %s, NOW(), %s)
        """

        for item in items:
            titulo = item.get('titulo', 'Juego sin nombre')
            descripcion = item.get('descripcion', '')
            precio = float(item.get('precio', 0))

            cursor.execute(
                sql_insert_compra,
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
        return jsonify({'exito': False, 'mensaje': f'Error en el servidor: {ex}'}), 500



def pagina_no_encontrada(error):
    return "<h1>Pagina no encontrada</h1>", 404

if __name__ == "__main__":
    app.register_error_handler(404, pagina_no_encontrada)
    app.run(host='0.0.0.0', port=5000, debug=True)
