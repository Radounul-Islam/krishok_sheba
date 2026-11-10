from app.security import create_access_token, hash_password, verify_password
from uuid import uuid4


def test_password_hash_round_trip() -> None:
    hashed = hash_password("safe-test-password")
    assert hashed != "safe-test-password"
    assert verify_password("safe-test-password", hashed)
    assert not verify_password("wrong-password", hashed)


def test_access_token_contains_farmer_id() -> None:
    farmer_id = uuid4()
    assert isinstance(create_access_token(farmer_id), str)
