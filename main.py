import logging
import platform
import subprocess
from typing import Optional

logging.basicConfig(filename="/tmp/flatpak_updater.log",
                    format='[Template] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger = logging.getLogger()
# can be changed to logging.DEBUG for debugging issues
logger.setLevel(logging.INFO)


class Plugin:
    # A normal method. It can be called from JavaScript using call_plugin_function("method_1", argument1, argument2)
    async def add(self, left, right):
        result = left + right
        logger.info(f"add result: {result}")
        return result

    async def getInstalledFlatpaks(self):
        try:
            result = subprocess.check_output(
                ['flatpak', 'list', '--app', '--columns=application'], encoding='utf-8')
            logger.info(
                f"getInstalledFlatpaks result={result}")
            return result.split()
        except subprocess.CalledProcessError:
            logger.error(
                f"execution of flatpak failed", exc_info=True)
            return []

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        user = self._whoAmI()
        logger.info(
            f"Plugin loaded with python version {platform.python_version()} as {user}")

    # Function called first during the unload process, utilize this to handle your plugin being removed
    async def _unload(self):
        logger.info("Goodbye World!")
        pass

    @staticmethod
    def _whoAmI() -> Optional[str]:
        try:
            user = subprocess.check_output(
                ['whoami'], encoding='utf-8').strip()
            logger.debug(f"whoami returned {user}")
            return user
        except Exception as e:
            logger.error("whoami failed", exc_info=True)
            return None
