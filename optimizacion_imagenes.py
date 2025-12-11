# ---------------------------------------------------------
# SCRIPT DE OPTIMIZACIÓN - TODO A WEBP (CON TRANSPARENCIA)
# ---------------------------------------------------------
# Este script convierte todas las imágenes de la lista a .webp
# manteniendo la transparencia en los PNGs.
# ---------------------------------------------------------

import os
from PIL import Image

INPUT_FOLDER = 'img'
OUTPUT_QUALITY = 80

# Lista de archivos a procesar
files_to_process = [
    "acceso-estrecho-bomba-hormigon.jpeg",
    "bombeo-hormigon-nave-industrial.jpeg",
    "bombeo-hormigon-zonas-dificiles.png",
    "bombeo-residencial-camion-hormigonera.jpeg",
    "camion-bomba-bombetec.png",  # Ahora se convertirá a WebP transparente
    "camion-bomba-calle-estrecha-olias.png",
    "camion-bombeo-hormigon-toledo.jpeg",
    "cimentacion-bomba-hormigon-toledo.jpeg",
    "empresa-bombeos-hormigon-toledo.jpeg",
    "fotoMiniatura192x192_sinSLL.png",
    "llenado-zapatas-cimentacion-vivienda.jpeg",
    "losa-cimentacion-hormigon-armado.jpeg",
    "pavimentacion-suelo-industrial.jpeg",
    "vertido-hormigon-obra-publica.jpeg",
    "asesoria_tecnica_bombeo_hormigon.jpeg"
]


def optimize_images():
    print("--- Iniciando Conversión a WebP ---")

    if not os.path.exists(INPUT_FOLDER):
        print(f"Error: No encuentro la carpeta '{INPUT_FOLDER}'")
        return

    # 1. PROCESAR IMÁGENES
    for filename in files_to_process:
        old_path = os.path.join(INPUT_FOLDER, filename)

        if os.path.exists(old_path):
            try:
                name, ext = os.path.splitext(filename)

                with Image.open(old_path) as img:
                    # Definir nombre de salida
                    new_filename = f"{name}.webp"
                    new_path = os.path.join(INPUT_FOLDER, new_filename)

                    # Guardar como WebP (mantiene transparencia automáticamente)
                    img.save(new_path, "WEBP", quality=OUTPUT_QUALITY)
                    print(f"✅ Convertido a WebP: {filename} -> {new_filename}")

            except Exception as e:
                print(f"❌ Error con {filename}: {e}")
        else:
            print(f"⚠️ No encontrado: {filename}")


if __name__ == "__main__":
    optimize_images()