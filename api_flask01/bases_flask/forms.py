from wtforms import Form
from wtforms import StringField, IntegerField, BooleanField, PasswordField, EmailField
from wtforms import validators
from wtforms import RadioField, SelectMultipleField, widgets


class MultiCheckboxField(SelectMultipleField):
    widget = widgets.ListWidget(prefix_label=False)
    option_widget = widgets.CheckboxInput()

class UserForm(Form):
    matricula=IntegerField('Matrícula', 
                           [validators.DataRequired(message='El campo es requerido')])
    nombre=StringField('Nombre',
                        [validators.DataRequired(message='El campo es requerido'), 
                                  validators.Length(min=1, max=50)])
    apellido=StringField('Apellido', [validators.DataRequired(message='El campo es requerido'), 
                                      validators.Length(min=1, max=50)])
    email=EmailField('Correo', [validators.Email(message='Ingrese un correo válido')])


class DistanciaForm(Form):
    x1=IntegerField('X1',
                        [validators.DataRequired(message='Coordenada requerida')])
    y1=IntegerField('Y1',
                        [validators.DataRequired(message='Coordenada requerida')])
    x2=IntegerField('X2',
                        [validators.DataRequired(message='Coordenada requerida')])
    y2=IntegerField('Y2',
                        [validators.DataRequired(message='Coordenada requerida')])


class PizzeriaForm(Form):
    nombre=StringField('Nombre', [validators.DataRequired(message='Nombre requerido')])
    direccion=StringField('Direccion', [validators.DataRequired(message='Direccion requerida')])
    telefono=StringField('Telefono', [validators.DataRequired(message='Telefono requerido')])
    tamano=RadioField('Tamaño Pizza', choices=[('chica','Chica $40'),
                                                 ('mediana','Mediana $80'),
                                                 ('grande','Grande $120')])
    ingredientes = MultiCheckboxField('Ingredientes', choices=[('jamon','Jamon $10'),
                                                               ('pina','Piña $10'),
                                                               ('champi','Champiñones $10')])
    
    cantidad = IntegerField('Num. de Pizzas', [validators.DataRequired(message='Cantidad requerida')], default=1)