import asyncio
import importlib.util
import os
import pathlib
import sys


def load_main_module():
    root = pathlib.Path(__file__).resolve().parent.parent
    src_path = root / "backend" / "src"
    main_path = src_path / "main.py"
    os.environ.setdefault("OPENAI_API_KEY", "test-openai-key")
    sys.path.insert(0, str(src_path))
    spec = importlib.util.spec_from_file_location("campaign_studio_main", str(main_path))
    module = importlib.util.module_from_spec(spec)
    sys.modules["campaign_studio_main"] = module
    spec.loader.exec_module(module)
    return module


def test_health_route():
    module = load_main_module()
    result = asyncio.run(module.health())
    assert result == {"status": "ok", "source": "campaign-studio"}
