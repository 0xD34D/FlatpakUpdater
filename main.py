import json
import logging
import platform
import subprocess
from typing import Dict, List, Optional
from dataclasses import dataclass

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
    hash:  str
    latestHash: str
    remote: str
    ref: str
    updateAvailable: bool

    def toJSON(self):
        return json.dumps(
            {
                "name": self.name,
                "appID": self.appID,
                "hash": self.hash,
                "latestHash": self.latestHash,
                "remote": self.remote,
                "ref": self.ref,
                "updateAvailable": self.updateAvailable
            },
            sort_keys=True,
            indent=4)


class Plugin:
    flatpaks: Dict[str, FlatpakInfo] = {}

    def serializeFlatpaks(self):
        res = {}

        for k, v in self.flatpaks.items():
            res[k] = {"name": v.name, "appID": v.appID, "hash": v.hash,
                      "latestHash": v.latestHash, "updateAvailable": v.updateAvailable}

        return res

    async def getUpdatableFlatpaks(self) -> List[str]:
        refs = self._getInstalledFlatpakRefs()
        names = self._getInstalledFlatpakNames()
        for _, (ref, name) in enumerate(zip(refs, names)):
            logger.info(f'Getting info for {name}[{ref}]')
            info = self._getFlatpakInfo(ref, name)
            data = info.toJSON()
            logger.info(f'{data}')
            if info.updateAvailable:
                logger.info(f'Update available for {ref}, adding to dict')
                self.flatpaks[ref] = info

        return self.serializeFlatpaks(self)

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
        except Exception as e:
            logger.error("whoami failed", exc_info=True)
            return None

    @staticmethod
    def _getInstalledFlatpakNames() -> List[str]:
        try:
            result = subprocess.check_output(
                ['flatpak', 'list', '--columns=name'], encoding='utf-8')
            return result.splitlines()
        except subprocess.CalledProcessError:
            logger.error(
                f"execution of flatpak failed", exc_info=True)
            return []

    @staticmethod
    def _getInstalledFlatpakRefs() -> List[str]:
        try:
            result = subprocess.check_output(
                ['flatpak', 'list', '--columns=ref'], encoding='utf-8')
            return result.splitlines()
        except subprocess.CalledProcessError:
            logger.error(
                f"execution of flatpak failed", exc_info=True)
            return []

    @staticmethod
    def _getFlatpakInfo(appID: str, name: str) -> Optional[FlatpakInfo]:
        info: FlatpakInfo = FlatpakInfo(
            name=name, appID=appID, hash=None, latestHash=None, remote=None, ref=None, updateAvailable=False)
        try:
            data = subprocess.check_output(
                ['flatpak', 'info', '-o', '-c', '-r', appID], encoding='utf-8').strip().split()
            info.ref = data[0]
            info.remote = data[1]
            info.hash = data[2]
        except:
            logger.error(
                f'failed to get commit info for {appID}', exc_info=True)
            return None

        try:
            info.latestHash = subprocess.check_output(
                ['flatpak', 'remote-info', info.remote, info.ref, '-c'], encoding='utf-8', timeout=2.5).strip()
        except subprocess.CalledProcessError:
            logger.error(
                f'failed to get remote commit info for {appID}', exc_info=True)
            return None

        info.updateAvailable = info.hash != info.latestHash

        return info
