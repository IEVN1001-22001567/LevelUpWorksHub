import math, bases_flask.forms as forms, json
from flask import Flask, render_template, request
from flask import make_response, jsonify



app= Flask(__name__)
ventas = []

@app.route('/')
def home():
    return "Hello World"

@app.route('/index')
def index():
    titulo="IEVN1001"
    listado=["Python", "Flask", "HTML", "CSS", "JavaScript"]
    return render_template('index.html', titulo=titulo, listado=listado)

@app.route('/aporb')
def aporb():
    return render_template('aporb.html')

@app.route('/resultado',methods=['POST'])
def resultado():
    n1=request.form.get("a")
    n2=request.form.get("b")
    return "La multiplicacion de {} y {} es {}".format(n1,n2, int(n1)*int(n2))

@app.route('/distancia',methods=['GET','POST'])
def distancia():
    total=""
    if request.method == 'POST':
        X1 = request.form.get("x1")
        Y1 = request.form.get("y1")
        X2 = request.form.get("x2")
        Y2 = request.form.get("y2")
        op = math.sqrt((float(X2)-float(X1))**2+(float(Y2)-float(Y1))**2)
        total="La distancia es {}".format(op)
    return render_template('distancia.html', total=total)



@app.route('/figuras', methods=['GET','POST'])
def figuras():
    figura = request.form.get('figura')
    resultado = ''
    if request.method == 'POST':
        if figura == 'cuadrado':
            lado = request.form.get('lado')
            if lado:
                resultado = float(lado) ** 2
        elif figura == 'triangulo':
            base = request.form.get('base')
            altura = request.form.get('altura')
            if base:
                resultado = (float(base) * float(altura)) / 2
        elif figura == 'circulo':
            radio = request.form.get('radio')
            if radio:
                resultado = 3.1416 * float(radio) ** 2
        elif figura == 'pentagono':
            lado = request.form.get('ladopent')
            apotema = request.form.get('apotema')
            if lado:
                resultado = (5 *float(lado) * float(apotema)) /2
    return render_template('figuras.html', figura=figura, resultado=resultado)


@app.route('/pizzeria', methods=['GET','POST'])
def pizzeria():
    nombre = ''
    direccion = ''
    telefono = ''
    tamano = ''
    ingredientes = []
    cantidad = 0
    orders = []
    datos = {}
    pizzeria_clas = forms.PizzeriaForm(request.form)
    orders_str = request.cookies.get('pizzas')
    if orders_str:
        orders = json.loads(orders_str)
    cookie_ventas_str = request.cookies.get('cookie_ventas')
    if cookie_ventas_str:
        ventas.clear()
        ventas.extend(json.loads(cookie_ventas_str))
    if request.method == 'POST':
        if request.form.get('btnElimina') == 'eliminar':
            response = make_response(render_template('Pizzeria.html', form=pizzeria_clas,
                                                     orders=[], ventas=ventas))
            response.delete_cookie('pizzas')
            return response
        if request.form.get('btnEliminaVentas') == 'eliminar':
            ventas.clear()
            response = make_response(render_template('Pizzeria.html', form=pizzeria_clas,
                                                     orders=orders, ventas=ventas))
            return response

        seleccionar=request.form.get('action')
        if seleccionar == 'quitar':
            if orders:
                orders.pop()

        elif seleccionar == 'terminar':
            nombre_raw = request.form.get('nombre')
            direccion = request.form.get('direccion')
            telefono = request.form.get('telefono')
            nombre_norm = nombre_raw.rstrip()
            if nombre_norm:
                total_cliente = 0
                for ordenes in orders:
                    nombre_o = ordenes.get('nombre').strip()
                    if nombre_o == nombre_norm:
                        total_cliente += ordenes.get('subtotal')
                if total_cliente > 0:
                    venta = {'nombre': nombre_norm, 'direccion': direccion, 'telefono': telefono, 'total': total_cliente}
                    ventas.append(venta)
                    orders = [orden for orden in orders 
                              if orden.get('nombre').rstrip() != nombre_norm]

        elif seleccionar == 'ventas_total':
            total_ventas_dia = 0
            for vent in ventas:
                total_ventas_dia += vent.get('total')
            response = make_response(render_template('Pizzeria.html', form=pizzeria_clas,
                                                     orders=orders, ventas=ventas, total_ventas_dia=total_ventas_dia))
            if request.method != 'GET':
                response.set_cookie('pizzas', json.dumps(orders))
            return response

        elif seleccionar == 'agregar':
            if not pizzeria_clas.validate():
                response = make_response(render_template('Pizzeria.html', form=pizzeria_clas,
                                                         orders=orders, ventas=ventas))
                return response
            nombre=pizzeria_clas.nombre.data
            direccion=pizzeria_clas.direccion.data
            telefono=pizzeria_clas.telefono.data
            tamano=pizzeria_clas.tamano.data
            ingredientes=pizzeria_clas.ingredientes.data or []
            cantidad=int(pizzeria_clas.cantidad.data)

            precios={'chica': 40, 'mediana': 80, 'grande': 120}
            base=precios.get(tamano)
            extra=10 * len(ingredientes)
            subtotal=(base + extra) * cantidad

            nombre_norm = (nombre).rstrip()
            datos = {'nombre': nombre_norm, 'direccion': direccion, 'telefono': telefono,
                     'tamano': tamano, 'ingredientes': ingredientes,
                     'cantidad': cantidad, 'subtotal': subtotal}
            orders.append(datos)

    response = make_response(render_template('Pizzeria.html', form=pizzeria_clas,
                                             orders=orders, ventas=ventas))
    if request.method != 'GET':
        response.set_cookie('pizzas', json.dumps(orders))
    return response


@app.route('/get_cookiespizzeria')
def get_cookiespizzeria():
    data_str = request.cookies.get('pizzas')
    if not data_str:
        return "No hay cookie", 404
    pizzas = json.loads(data_str)
    return jsonify(pizzas)

@app.route("/hola")
def func():
    return "<h1>Hola!!!</h1>"

@app.route("/alumnos",methods=['GET','POST'])
def alumnos():
    mat=0
    nom=''
    apell=''
    email=''
    estudiantes=[]
    datos={}
    alumno_clas=forms.UserForm(request.form)
    if request.method=='POST' and alumno_clas.validate():
        if request.form.get("btnElimina")=='eliminar':
            response = make_response(render_template('Alumnos.html'))
            response.delete_cookie('usuario')

    
        mat=alumno_clas.matricula.data
        nom=alumno_clas.nombre.data
        apell=alumno_clas.apellido.data
        email=alumno_clas.email.data

        datos={'matricula':mat, 'nombre':nom.rstrip(),
               'apellido':apell.rstrip(), 'email':email.rstrip()}
        
        data_str=request.cookies.get("usuario")

        if not data_str:
            return "No hay cookie guardada", 404
        
        estudiantes=json.loads(data_str)
        estudiantes.append(datos)

    response=make_response(render_template('Alumnos.html',
            form=alumno_clas, mat=mat, nom=nom, apell=apell, email=email))
    
    if request.method!='GET':
        response.set_cookie('usuario',json.dumps(estudiantes))

    return response
"""     return render_template('Alumnos.html',
                           form=alumno_clas,
                           mat=mat,
                           nom=nom,
                           apell=apell,
                           email=email) """


@app.route("/get_cookie")
def get_cookie():
    
    data_str = request.cookies.get("usuario")
    if not data_str:
        return "No hay cookie guardada", 404
    
    estudiantes = json.loads(data_str)

    return jsonify(estudiantes)






@app.route("/distanciamacro",methods=['GET','POST'])
def distanciamacro():
    resultado=0
    distancia_clas=forms.DistanciaForm(request.form)
    if request.method=='POST' and distancia_clas.validate():
        x1=distancia_clas.x1.data
        y1=distancia_clas.y1.data
        x2=distancia_clas.x2.data
        y2=distancia_clas.y2.data
        resultado=math.sqrt((float(x2)-float(x1))**2+(float(y2)-float(y1))**2)
    return render_template('distanciasmacro.html',
                           form=distancia_clas,
                           resultado=resultado)



@app.route("/user/<string:user>")
def user(user):
    return "<h1>Hello, {}!</h1>".format(user)

@app.route("/square/<int:num>")
def square(num):
    return "<h1>El cuadrado de {} es {}.</h1>".format(num, num**2)

@app.route("/repeat/<string:text>/<int:times>")
def repeat(text, times):
    return "<h1>"+ " ".join([text * times]) + "</h1>"


@app.route("/suma/<float:a>/<float:b>")
def suma(a, b):
    return "<h1>La suma de {} y {} es{}.</h1>".format(a, b, a+b)


@app.route("/prueba")
def func12():
    return ""
    

if __name__== '__main__':
    app.run(debug=True)