from PIL import Image
import torch

from app.utils.embedding import (
    get_image_embedding,
    calculate_embedding_similarity,
)


def get_reference_embedding(
    image: Image.Image,
) -> torch.Tensor:
    return get_image_embedding(image)


def calculate_person_similarity(
    reference_embedding: torch.Tensor,
    detected_crop: Image.Image,
) -> float:
    detected_embedding = get_image_embedding(
        detected_crop
    )

    return calculate_embedding_similarity(
        reference_embedding,
        detected_embedding,
    )