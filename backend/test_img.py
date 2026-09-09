from PIL import Image

from app.utils.embedding import calculate_similarity

img = Image.open('Linux.png').convert('RGB')
img1 = Image.open('images.png').convert('RGB')

similarity = calculate_similarity(img, img1)

print(f'Similarity: {similarity:.4f}')