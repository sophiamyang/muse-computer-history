#!/usr/bin/env python3
"""Contact sheet of PNGs with their names. tools/sheet.py out.png cols a.png b.png ..."""
import sys
from PIL import Image, ImageDraw
out, cols, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
ims = [Image.open(f).convert('RGB') for f in files]; w, h = ims[0].size
S = Image.new('RGB', (cols * w, ((len(ims) + cols - 1) // cols) * (h + 22)), (24, 24, 24)); d = ImageDraw.Draw(S)
for i, (f, im) in enumerate(zip(files, ims)):
    x, y = (i % cols) * w, (i // cols) * (h + 22); S.paste(im.resize((w, h)), (x, y)); d.text((x + 6, y + h + 4), f.split('/')[-1], fill=(220, 220, 220))
S.save(out)
