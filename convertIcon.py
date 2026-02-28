from PIL import Image

img = Image.open('public/icon.png')
img = img.resize((256, 256))
img.save('build/icon.ico', format='ICO', sizes=[(256, 256)])
