import os
import shutil
from datetime import datetime

class JuegosStorageService:
    
    def __init__(self, carpeta_juegos):
        self.carpeta_juegos = carpeta_juegos
        self.crear_carpeta()
        print(f"✅ StorageService iniciado en: {self.carpeta_juegos}")
    
    def crear_carpeta(self):
        os.makedirs(self.carpeta_juegos, exist_ok=True)
    
    def guardar_archivo(self, archivo_origen, nombre_archivo):
        try:
            ruta_destino = os.path.join(self.carpeta_juegos, nombre_archivo)
            
            shutil.copy2(archivo_origen, ruta_destino)
            
            tamaño = os.path.getsize(ruta_destino)
            
            print(f"✅ Archivo guardado: {nombre_archivo} ({tamaño/1024/1024:.2f} MB)")
            
            return {
                'exito': True,
                'ruta': ruta_destino,
                'nombre': nombre_archivo,
                'tamaño': tamaño,
                'tamaño_mb': tamaño / 1024 / 1024
            }
        except Exception as e:
            print(f"❌ Error guardando archivo: {e}")
            return {
                'exito': False,
                'error': str(e)
            }
    
    def obtener_ruta_archivo(self, nombre_archivo):

        ruta = os.path.join(self.carpeta_juegos, nombre_archivo)
        if os.path.exists(ruta):
            return ruta
        return None
    
    def archivo_existe(self, nombre_archivo):
        ruta = os.path.join(self.carpeta_juegos, nombre_archivo)
        return os.path.exists(ruta)
    
    def obtener_info_archivo(self, nombre_archivo):

        ruta = os.path.join(self.carpeta_juegos, nombre_archivo)
        
        if not os.path.exists(ruta):
            return None
        
        tamaño = os.path.getsize(ruta)
        fecha_mod = os.path.getmtime(ruta)
        
        return {
            'nombre': nombre_archivo,
            'ruta': ruta,
            'tamaño': tamaño,
            'tamaño_mb': tamaño / 1024 / 1024,
            'tamaño_gb': tamaño / 1024 / 1024 / 1024,
            'fecha_modificacion': datetime.fromtimestamp(fecha_mod).strftime('%Y-%m-%d %H:%M:%S')
        }
    
    def listar_archivos(self):

        archivos = []
        try:
            for archivo in os.listdir(self.carpeta_juegos):
                ruta_completa = os.path.join(self.carpeta_juegos, archivo)
                if os.path.isfile(ruta_completa):
                    info = self.obtener_info_archivo(archivo)
                    archivos.append(info)
        except Exception as e:
            print(f"Error listando archivos: {e}")
        
        return archivos
    
    def obtener_espacio_disponible(self):
        """
        Obtiene el espacio disponible en la carpeta
        
        Returns:
            Diccionario con espacio disponible
        """
        try:
            import shutil
            estadisticas = shutil.disk_usage(self.carpeta_juegos)
            
            return {
                'total': estadisticas.total,
                'total_gb': estadisticas.total / 1024 / 1024 / 1024,
                'usado': estadisticas.used,
                'usado_gb': estadisticas.used / 1024 / 1024 / 1024,
                'libre': estadisticas.free,
                'libre_gb': estadisticas.free / 1024 / 1024 / 1024
            }
        except Exception as e:
            print(f"Error obteniendo espacio: {e}")
            return None
    
    def eliminar_archivo(self, nombre_archivo):

        try:
            ruta = os.path.join(self.carpeta_juegos, nombre_archivo)
            if os.path.exists(ruta):
                os.remove(ruta)
                print(f"✅ Archivo eliminado: {nombre_archivo}")
                return True
            else:
                print(f"⚠️ Archivo no encontrado: {nombre_archivo}")
                return False
        except Exception as e:
            print(f"❌ Error eliminando archivo: {e}")
            return False
    
    def obtener_tamaño_total(self):

        tamaño_total = 0
        for archivo in self.listar_archivos():
            tamaño_total += archivo['tamaño']
        
        return {
            'tamaño_bytes': tamaño_total,
            'tamaño_mb': tamaño_total / 1024 / 1024,
            'tamaño_gb': tamaño_total / 1024 / 1024 / 1024
        }