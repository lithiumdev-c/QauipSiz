import torch
from PIL import Image
from transformers import CLIPModel, CLIPProcessor


MODEL_NAME = "openai/clip-vit-base-patch32"

processor = CLIPProcessor.from_pretrained(MODEL_NAME)
model = CLIPModel.from_pretrained(MODEL_NAME)

model.eval()


def get_image_embedding(image: Image.Image) -> torch.Tensor:
    inputs = processor(
        images=image
    )
    pixel_values = torch.stack(inputs["pixel_values"])

    with torch.no_grad():
        vision_outputs = model.vision_model(
            pixel_values=pixel_values,
        )

        embedding = model.visual_projection(
            vision_outputs.pooler_output
        )

    embedding = torch.nn.functional.normalize(
        embedding,
        p=2,
        dim=-1,
    )

    return embedding


def calculate_similarity(
    image1: Image.Image,
    image2: Image.Image,
) -> float:
    embedding1 = get_image_embedding(image1)
    embedding2 = get_image_embedding(image2)

    similarity = torch.nn.functional.cosine_similarity(
        embedding1,
        embedding2,
    )

    return float(similarity.item())

def calculate_embedding_similarity(
    embedding1: torch.Tensor,
    embedding2: torch.Tensor
) -> float:
    similarity = torch.nn.functional.cosine_similarity(
        embedding1,
        embedding2
    )

    return float(similarity.item())