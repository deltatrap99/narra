from pathlib import Path
from PIL import Image, ImageDraw
import json
source=Path(r"C:\Users\Pc\AppData\Local\Temp\codex-clipboard-a20746e4-e020-47e3-b652-4548ee5a0f7b.png")
root=Path(r"C:\Users\Pc\Documents\ChatGPT\Galaxy Education\narra")
out=root/"public"/"brand"
out.mkdir(parents=True,exist_ok=True)
im=Image.open(source).convert("RGB")
crop=im.crop((1000,640,1570,805))
light=Image.new("RGBA",crop.size)
dark=Image.new("RGBA",crop.size)
for y in range(crop.height):
    for x in range(crop.width):
        r,g,b=crop.getpixel((x,y))
        brightness=max(r,g,b)
        if brightness<15:
            continue
        is_lime=(x+1000>=1418 and g>r*1.12 and g>b*1.12)
        if is_lime:
            alpha=min(255,round(brightness/249*255))
            rgb=tuple(min(255,round(v*255/alpha)) for v in (r,g,b))
            light.putpixel((x,y),(*rgb,alpha))
            dark.putpixel((x,y),(*rgb,alpha))
        elif x+1000<1420:
            alpha=brightness
            light.putpixel((x,y),(255,255,255,alpha))
            dark.putpixel((x,y),(0,0,0,alpha))
bounds=light.getbbox()
light=light.crop(bounds)
dark=dark.crop(bounds)
light.save(out/"logo-light.webp",lossless=True,method=6)
dark.save(out/"logo-dark.webp",lossless=True,method=6)
icon=light.crop((1418-1000-bounds[0],0,light.width,light.height))
icon=icon.crop(icon.getbbox())
icon.save(out/"icon.webp",lossless=True,method=6)
icon.save(out/"icon.png")
tag=im.crop((1145,811,1410,853)).convert("RGBA")
for y in range(tag.height):
    for x in range(tag.width):
        r,g,b,a=tag.getpixel((x,y))
        brightness=max(r,g,b)
        if brightness<18: tag.putpixel((x,y),(0,0,0,0))
        else:
            alpha=brightness
            tag.putpixel((x,y),(min(255,round(r*255/alpha)),min(255,round(g*255/alpha)),min(255,round(b*255/alpha)),alpha))
tag=tag.crop(tag.getbbox())
tag.save(out/"tagline.webp",lossless=True,method=6)
preview=Image.new("RGB",(800,400),"#f9fbf6")
ImageDraw.Draw(preview).rectangle((0,0,800,190),fill="#000000")
for asset,y in [(light,35),(dark,235)]:
    display=asset.copy()
    display.thumbnail((620,120))
    preview.paste(display,((800-display.width)//2,y),display)
preview.save(root/"tools/brand-logo-preview.png")
metadata={"source":str(source),"source_size":im.size,"wordmark_crop_source":[1000,640,1570,805],"trim_bounds":bounds,"logo_size":light.size,"icon_size":icon.size,"tagline_size":tag.size,"palette":{"black":"#000000","lime":"#9CE943","orange":"#FF6E0B","cyan":"#6DD9FF"},"source_wordmark_lime_dominant":"#9AF953","tagline":"Your voice. Your story."}
(out/"asset-provenance.json").write_text(json.dumps(metadata,indent=2),encoding="utf-8")
print(json.dumps(metadata,indent=2))

