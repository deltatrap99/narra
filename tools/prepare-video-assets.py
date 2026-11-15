from PIL import Image, ImageDraw
from pathlib import Path
import json
root=Path(r"C:\Users\Pc\Documents\ChatGPT\Galaxy Education\narra")
out=root/"public"/"assets"
tutors=Image.open(root/"tools/video-reference/tutors-list.jpg").convert("RGB")
entries=[
("henry-body",(74,470,203,665),(45,600)),
("camila-body",(68,802,217,979),(45,900)),
("dwayne-body",(64,1128,211,1323),(45,1200)),
]
metadata={}
for name,box,sample in entries:
    im=tutors.crop(box)
    im.save(out/(name+".webp"),quality=97,method=6)
    bg=tutors.getpixel(sample)
    metadata[name]={"box":box,"size":im.size,"background":"#%02x%02x%02x"%bg,"source":"video2 at 5s, tutors-list.jpg"}
for name,box in [("henry",(88,503,190,605)),("dwayne",(80,1128,202,1250)),("camila-reference",(78,802,205,929))]:
    im=tutors.crop(box).convert("RGBA")
    mask=Image.new("L",im.size,0)
    ImageDraw.Draw(mask).ellipse((0,0,im.width-1,im.height-1),fill=255)
    im.putalpha(mask)
    im.save(out/(name+".webp"),quality=97,method=6)
    metadata[name]={"box":box,"size":im.size,"source":"video2 at 5s, tutors-list.jpg","alpha":True}
practice=Image.open(root/"tools/video-reference/practice-scan-07.png").convert("RGB")
illustrations=[
("house-reference",(455,447,604,575),(420,500)),
("plane-reference",(72,840,313,979),(60,880)),
("briefcase-reference",(466,850,602,976),(400,900)),
("books-reference",(99,1282,289,1426),(50,1330)),
("plant-reference",(477,1283,594,1426),(400,1330)),
("tutor-stack-reference",(57,207,254,280),(47,250)),
]
for name,box,sample in illustrations:
    im=practice.crop(box)
    im.save(out/(name+".webp"),quality=97,method=6)
    bg=practice.getpixel(sample)
    metadata[name]={"box":box,"size":im.size,"background":"#%02x%02x%02x"%bg,"source":"video1 approx 55.1s, practice-scan-07.png"}
(root/"tools/video-reference/asset-crops.json").write_text(json.dumps(metadata,indent=2),encoding="utf-8")
print(json.dumps(metadata,indent=2))

