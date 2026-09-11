from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user import UserRepository


class UserService:
    @classmethod
    async def get_all(cls, session: AsyncSession):
        return await UserRepository.get_all(session=session)
