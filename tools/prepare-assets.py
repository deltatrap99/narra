from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import json
sources=[["house","C:\\Users\\Pc\\.codex\\generated_images\\01a1e009-04a6-7a90-9bbe-396dca123292\\exec-3f152d1e-7f65-4069-90bc-2ec4790d020e.png"],["plane","C:\\Users\\Pc\\.codex\\generated_images\\01a1e009-04a6-7a90-9bbe-396dca123292\\exec-9f2674cd-9917-488a-94b0-7aab15ed228e.png"],["briefcase","C:\\Users\\Pc\\.codex\\generated_images\\01a1e009-04a6-7a90-9bbe-396dca123292\\exec-ba74af7e-138b-49ba-924b-0d39c8dc5c63.png"],["books","C:\\Users\\Pc\\.codex\\generated_images\\01a1e009-04a6-7a90-9bbe-396dca123292\\exec-f73b68af-856c-4481-9b31-8e80a5f76d77.png"],["plant","C:\\Users\\Pc\\.codex\\generated_images\\01a1e009-04a6-7a90-9bbe-396dca123292\\exec-271f1837-d3be-448a-9e04-01f8fbe12bf0.png"],["camila","C:\\Users\\Pc\\.codex\\generated_images\\01a1e009-04a6-7a90-9bbe-396dca123292\\exec-baa8fc38-2c7d-45ac-8140-d31b704f0d49.png"]]
dest=Path(r"C:\Users\Pc\Documents\ChatGPT\Galaxy Education\narra\public\assets")
qa=Image.new("RGB",(900,600),(245,245,242))
for i,(name,path) in enumerate(sources):
    im=Image.open(path).convert("RGBA")
    im.thumbnail((768,768),Image.Resampling.LANCZOS)
    im.save(dest/(name+".webp"),"WEBP",quality=92,method=6)
    thumb=im.copy()
    thumb.thumbnail((270,270),Image.Resampling.LANCZOS)
    x=(i%3)*300+(300-thumb.width)//2
    y=(i//3)*300
    qa.paste(thumb,(x,y),thumb)
    ImageDraw.Draw(qa).text(((i%3)*300+10,(i//3)*300+278),name,fill=(34,31,43))
    print(json.dumps({"name":name,"size":im.size,"alpha_range":im.getchannel("A").getextrema(),"bbox":im.getbbox(),"bytes":(dest/(name+".webp")).stat().st_size}))
qa.save(dest.parent.parent/"tools"/"assets-preview.jpg",quality=92)

