import uuid

from fastapi import UploadFile

from app.core.storage import supabase

BUCKET_NAME = "videos"


async def upload_video(
    file: UploadFile,
    case_id: int,
) -> str:
    extension = ""

    if file.filename and "." in file.filename:
        extension = "." + file.filename.rsplit(".", 1)[1]

    file_path = (
        f"cases/{case_id}/{uuid.uuid4()}{extension}"
    )

    file_bytes = await file.read()

    supabase.storage.from_(BUCKET_NAME).upload(
        file_path,
        file_bytes,
        {
            "content-type": (
                file.content_type
                or "application/octet-stream"
            )
        },
    )

    return file_path


def delete_video(file_path: str):
    supabase.storage.from_(BUCKET_NAME).remove(
        [file_path]
    )


def get_video_url(file_path: str) -> str:
    response = supabase.storage.from_(
        BUCKET_NAME
    ).create_signed_url(
        file_path,
        3600,
    )

    signed_url = response.get("signedURL")

    if not signed_url:
        raise RuntimeError(
            "Failed to create signed URL"
        )

    return signed_url


async def upload_person_photo(
    file: UploadFile,
    person_id: int,
) -> str:
    extension = ""

    if file.filename and "." in file.filename:
        extension = "." + file.filename.rsplit(
            ".", 1
        )[1].lower()

    file_path = (
        f"persons/{person_id}/{uuid.uuid4()}{extension}"
    )

    file_bytes = await file.read()

    supabase.storage.from_("persons").upload(
        file_path,
        file_bytes,
        {
            "content-type": (
                file.content_type
                or "application/octet-stream"
            )
        },
    )

    return file_path


def delete_person_photo(file_path: str):
    supabase.storage.from_("persons").remove(
        [file_path]
    )


def get_person_photo_url(file_path: str) -> str:
    response = supabase.storage.from_(
        "persons"
    ).create_signed_url(
        file_path,
        3600,
    )

    signed_url = response.get("signedURL")

    if not signed_url:
        raise RuntimeError(
            "Failed to create person photo signed URL"
        )

    return signed_url

async def upload_match_frame(
    frame_bytes: bytes,
    video_id: int,
) -> str:
    file_path = (
        f"videos/{video_id}/{uuid.uuid4()}.jpg"
    )

    supabase.storage.from_("match-frames").upload(
        file_path,
        frame_bytes,
        {
            "content-type": "image/jpeg",
        },
    )

    return file_path


def get_match_frame_url(file_path: str) -> str:
    response = supabase.storage.from_(
        "match-frames"
    ).create_signed_url(
        file_path,
        3600,
    )

    signed_url = response.get("signedURL")

    if not signed_url:
        raise RuntimeError(
            "Failed to create match frame signed URL"
        )

    return signed_url