import {
  definePlugin,
  DialogButton,
  Field,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  SteamSpinner,
  staticClasses,
} from "decky-frontend-lib";
import { PyInterop } from "./PyInterop";
import { useEffect, useState, VFC } from "react";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { FlatpakInfo } from "./FlatpakInfo";

type FlatpaksDictionary = {
  [key: string]: FlatpakInfo
}

const Content: VFC<{ serverAPI: ServerAPI }> = ({ }) => {
  const [flatPaks, setUpdatableFlatpaks] = useState<FlatpaksDictionary>({});

  useEffect(() => {
    PyInterop.getUpdatableFlatpaks()
      .then(data => {
        if (data.success) {
          setUpdatableFlatpaks(data.result);
        }
      });
  }, [])

  return (
    <PanelSection title="Flatpaks">
      <PanelSectionRow>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {Object.values(flatPaks).length > 0 &&
            <Field label={Object.values(flatPaks).length}> updates available</Field>
          }
          {Object.values(flatPaks).length == 0 &&
            <div>
              <i>Checking for updates</i>
              <div>
                <SteamSpinner />
              </div>
            </div>
          }
        </div>
      </PanelSectionRow>

      <PanelSectionRow>
        {
          Object.values(flatPaks).map((info) => (
            renderInfoIfUpdateAvailable(info)
          ))
        }
      </PanelSectionRow>
    </PanelSection>
  );
};

function renderInfoIfUpdateAvailable(info: FlatpakInfo) {
  if (info.updateAvailable) {
    return (
      <Field label={info.name} />
    )
  }

  return (null)
}

const DeckyPluginRouterTest: VFC = () => {
  return (
    <div style={{ marginTop: "50px", color: "white" }}>
      Hello World!
      <DialogButton onClick={() => Router.NavigateToStore()}>
        Go to Store
      </DialogButton>
    </div>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  PyInterop.setServer(serverApi);
  serverApi.routerHook.addRoute("/decky-plugin-test", DeckyPluginRouterTest, {
    exact: true,
  });

  return {
    title: <div className={staticClasses.Title}>Flatpak Updater</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaCloudDownloadAlt />,
    onDismount() {
      serverApi.routerHook.removeRoute("/decky-plugin-test");
    },
  };
});
