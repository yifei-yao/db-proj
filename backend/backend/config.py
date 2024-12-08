import tomllib
from pathlib import Path

CONFIG_FILE_PATH = Path(__file__).parent / "config.toml"


def load_config():
    """Load application configuration from config.toml."""
    with open(CONFIG_FILE_PATH, "rb") as f:
        config = tomllib.load(f)
    return config


CONFIG = load_config()
