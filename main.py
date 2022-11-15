import json
import logging
import platform
import subprocess
from dataclasses import dataclass
from typing import Dict, List, Optional

logging.basicConfig(filename="/tmp/flatpak_updater.log",
                    format='[FlatpakUpdater] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger = logging.getLogger()
# can be changed to logging.DEBUG for debugging issues
logger.setLevel(logging.INFO)


@dataclass
class FlatpakInfo:
    name: str
    appID: str

    def toJSON(self):
        return json.dumps(
            {
                "name": self.name,
                "appID": self.appID
            },
            sort_keys=True,
            indent=4)


class Plugin:
    flatpaks: Dict[str, FlatpakInfo] = {}

    def serializeFlatpaks(self):
        res = {}

        for k, v in self.flatpaks.items():
            res[k] = {
                "name": v.name,
                "appID": v.appID
            }

        return res

    async def getUpdatableFlatpaks(self) -> List[str]:
        self.flatpaks.clear()
        paks = await self._getInstalledFlatpaksWithUpdates()
        for pak in paks:
            logger.info(f'Getting info for {pak}')
            name, ref = pak.split('\t')
            info = FlatpakInfo(name=name, appID=ref)
            data = info.toJSON()
            logger.info(f'{data}')
            self.flatpaks[ref] = info

        return self.serializeFlatpaks(self)

    async def updateFlatpak(self, appID: str, dry_run: bool = False) -> bool:
        return self._updateFlatpak(appID=appID, dry_run=dry_run)

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        user = self._whoAmI()
        logger.info(
            f"Plugin loaded with python version {platform.python_version()} as {user}")

        pass

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
        except Exception:
            logger.error("whoami failed", exc_info=True)
            return None

    @staticmethod
    async def _getInstalledFlatpaksWithUpdates() -> List[str]:
        try:
            result = subprocess.check_output(
                ['flatpak', 'remote-ls', '--updates', '--columns=name,ref'], encoding='utf-8')
            return result.splitlines()
        except subprocess.CalledProcessError:
            logger.error(
                '_getInstalledFlatpaksWithUpdates() failed', exc_info=True)
            return []

    @staticmethod
    def _updateFlatpak(appID: str, dry_run: bool = False) -> bool:
        logger.info(f'Updating {appID} dry_run={dry_run}...')
        try:
            result = subprocess.check_output(
                ['flatpak', 'update', '--no-deploy' if dry_run else '-v', '--noninteractive', appID], encoding='utf-8')
            logger.info(f'_updateFlatpak({appID}):\n{result}')
            return True
        except subprocess.CalledProcessError:
            logger.error(
                f'Failed to update flatpak {appID}', exc_info=True)
            return False
