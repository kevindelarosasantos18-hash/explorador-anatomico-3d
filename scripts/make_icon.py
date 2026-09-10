"""Genera los iconos de la PWA (silueta humana en pose de exploracion,
sobre el fondo oscuro del tema) a partir de un solo dibujo vectorial simple.

Uso: python scripts/make_icon.py
"""

from PIL import Image, ImageDraw
import math
import os

BG = (10, 16, 24, 255)       # --bg
FIGURE = (47, 201, 176, 255)  # --teal

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "icons")
os.makedirs(OUT_DIR, exist_ok=True)


def draw_figure(size):
    img = Image.new("RGBA", (size, size), BG)
    d = ImageDraw.Draw(img)
    s = size / 512.0

    def R(*coords):
        return [c * s for c in coords]

    # Cabeza
    d.ellipse(R(206, 70, 306, 170), fill=FIGURE)
    # Torso (capsula)
    d.rounded_rectangle(R(196, 175, 316, 340), radius=55 * s, fill=FIGURE)
    # Brazo derecho (en diagonal, pose de exploracion)
    d.line(R(310, 205, 430, 150), fill=FIGURE, width=int(46 * s), joint="curve")
    d.ellipse(R(407, 127, 453, 173), fill=FIGURE)
    # Brazo izquierdo
    d.line(R(202, 205, 82, 150), fill=FIGURE, width=int(46 * s), joint="curve")
    d.ellipse(R(59, 127, 105, 173), fill=FIGURE)
    # Pierna derecha
    d.rounded_rectangle(R(256, 300, 316, 460), radius=30 * s, fill=FIGURE)
    # Pierna izquierda
    d.rounded_rectangle(R(196, 300, 256, 460), radius=30 * s, fill=FIGURE)

    return img


def rounded_square(img, radius_pct=0.22):
    size = img.size[0]
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, size, size], radius=int(size * radius_pct), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


sizes_plain = [512, 384, 192, 180, 152, 144, 128, 96, 72, 32, 16]
for sz in sizes_plain:
    im = draw_figure(sz)
    im.save(os.path.join(OUT_DIR, f"icon-{sz}.png"))

# Favicon multi-resolucion
draw_figure(16).save(os.path.join(OUT_DIR, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])

# Apple touch icon (Safari lo espera con esquinas cuadradas, iOS lo redondea solo)
draw_figure(180).save(os.path.join(OUT_DIR, "apple-touch-icon.png"))

# Maskable icon (Android adaptive): el contenido debe caber en el circulo
# central ~80% para no recortarse -- se reduce la figura y se deja el fondo
# solido hasta el borde.
maskable = Image.new("RGBA", (512, 512), BG)
figure_small = draw_figure(380)
maskable.paste(figure_small, (66, 66), figure_small)
maskable.save(os.path.join(OUT_DIR, "icon-512-maskable.png"))

print("Iconos generados en", OUT_DIR)
