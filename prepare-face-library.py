"""Crop real source pixels around a detected head; never synthesize a face.
Run after build-face-library.cjs. Output PNGs retain the source image licence.
"""
import sys, json, html, re, hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT/'.qa'/'face-tools'))
import cv2
from PIL import Image, ImageDraw, ImageFont, PngImagePlugin
CACHE=ROOT/'.qa'/'face-source-cache'
OUT=ROOT/'public'/'player-faces'/'gold'
records=json.loads((CACHE/'eligible-licensed.json').read_text('utf8'))
front=cv2.CascadeClassifier(cv2.data.haarcascades+'haarcascade_frontalface_default.xml')
profile=cv2.CascadeClassifier(cv2.data.haarcascades+'haarcascade_profileface.xml')
def plain(value): return html.unescape(re.sub('<[^>]+>','',value or '')).strip()
accepted=[]; rejected=[]
overrides={'gold-231443':(320,20,480)} # Visually checked Dembélé crop; jersey patterns confuse Haar.
for record in records:
    source=CACHE/(record['id']+'.source')
    if not source.exists(): continue
    image=Image.open(source).convert('RGB')
    import numpy as np
    grey=cv2.cvtColor(np.array(image),cv2.COLOR_RGB2GRAY)
    faces=front.detectMultiScale(grey,scaleFactor=1.08,minNeighbors=6,minSize=(55,55))
    if len(faces)==0: faces=profile.detectMultiScale(grey,scaleFactor=1.08,minNeighbors=5,minSize=(55,55))
    faces=sorted([f for f in faces if f[1]+f[3]/2<image.height*.65],key=lambda f:int(f[2])*int(f[3]),reverse=True)
    if record['id'] in overrides:
        left,top,size=overrides[record['id']]
    elif not faces or (len(faces)>1 and faces[0][2]*faces[0][3]<faces[1][2]*faces[1][3]*2):
        rejected.append({'name':record['name'],'reason':'No unambiguous single head found'});continue
    else:
        x,y,w,h=map(int,faces[0]);size=min(image.width,image.height,int(max(w,h)*1.7))
        cx=x+w/2;cy=y+h*.43
        left=max(0,min(image.width-size,int(cx-size/2)));top=max(0,min(image.height-size,int(cy-size/2)))
    crop=image.crop((left,top,left+size,top+size)).resize((256,256),Image.Resampling.LANCZOS).convert('RGBA')
    # A head-sized crop with a soft circular edge fits the existing portrait UI.
    mask=Image.new('L',(256,256));ImageDraw.Draw(mask).ellipse((1,1,255,255),fill=255)
    crop.putalpha(mask)
    crop=crop.quantize(colors=256,method=Image.Quantize.FASTOCTREE)
    pnginfo=PngImagePlugin.PngInfo()
    pnginfo.add_text('Author',plain(record['authorHtml']))
    pnginfo.add_text('Source',record['sourcePage'])
    pnginfo.add_text('License',record['licenseName']+' '+record['licenseUrl'])
    pnginfo.add_text('Changes','Head crop, resize, palette optimisation and circular alpha edge; no synthesized face features.')
    filename=record['id']+'.png';crop.save(OUT/filename,optimize=True,pnginfo=pnginfo)
    final={k:v for k,v in record.items() if k not in ['authorHtml','creditHtml','downloadUrl','sourceImage']}
    final.update(image='/public/player-faces/gold/'+filename,author=plain(record['authorHtml']),credit=plain(record['creditHtml']),crop={'left':left,'top':top,'size':size,'sourceWidth':image.width,'sourceHeight':image.height},changes='Head crop, resize to 256px, palette optimisation, circular alpha edge. No synthesized face features.',sha256=hashlib.sha256((OUT/filename).read_bytes()).hexdigest())
    accepted.append(final)
manifest={'version':1,'source':'Wikimedia Commons licensed portraits; EA public ratings eligibility; Wikidata identity/sex','goldRule':{'minimumOverall':75,'source':'https://www.ea.com/ea-originals/news/explaining-rarity-in-fifa-ultimate-team'},'faces':accepted}
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
(CACHE/'crop-rejections.json').write_text(json.dumps(rejected,ensure_ascii=False,indent=2),encoding='utf8')
thumb=128;cols=8;rows=(len(accepted)+cols-1)//cols
sheet=Image.new('RGB',(cols*thumb,rows*(thumb+32)), '#242a26');draw=ImageDraw.Draw(sheet)
for i,item in enumerate(accepted):
    photo=Image.open(OUT/(item['id']+'.png')).convert('RGBA').resize((thumb,thumb))
    x=(i%cols)*thumb;y=(i//cols)*(thumb+32);sheet.paste(photo,(x,y),photo)
    draw.text((x+3,y+thumb+2),str(i+1)+' '+item['name'][:18],fill='white')
sheet.save(CACHE/'contact-sheet.jpg')
for page in range((len(accepted)+39)//40):
    sheet.crop((0,page*5*(thumb+32),cols*thumb,min(sheet.height,(page+1)*5*(thumb+32)))).save(CACHE/('contact-sheet-'+str(page+1)+'.jpg'))
print(json.dumps({'accepted':len(accepted),'rejected':rejected,'contactSheet':str(CACHE/'contact-sheet.jpg')},ensure_ascii=False))
