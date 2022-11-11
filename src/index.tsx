import {
  definePlugin,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  SteamSpinner,
  staticClasses,
  ToggleField,
  ButtonItem,
  ProgressBar,
  Spinner,
} from "decky-frontend-lib";
import { PyInterop } from "./PyInterop";
import { useEffect, useState, VFC } from "react";
import { FaBuffer } from "react-icons/fa";
import { FlatpakInfo } from "./FlatpakInfo";

type FlatpaksDictionary = {
  [key: string]: FlatpakInfo
}

enum UpdateCheckerState {
  IDLE = 0,
  CHECKING,
}

var paksToUpdate: FlatpaksDictionary = {};

const Content: VFC<{ serverAPI: ServerAPI }> = ({ }) => {
  const [flatPaks, setUpdatableFlatpaks] = useState<FlatpaksDictionary>({});
  const [_, reloadGUI] = useState<any>("");
  const [updaterState, setUpdaterState] = useState<UpdateCheckerState>(UpdateCheckerState.IDLE);
  if (Object.values(flatPaks).length == 0) {
    paksToUpdate = {};
  }

  if (updaterState == UpdateCheckerState.CHECKING) {
    async () => {
      PyInterop.getUpdatableFlatpaks()
        .then(data => {
          if (data.success) {
            setUpdatableFlatpaks(data.result);
          }
        });
    }
  }

  useEffect(() => {
    if (updaterState == UpdateCheckerState.CHECKING) {
      PyInterop.getUpdatableFlatpaks()
        .then(data => {
          if (data.success) {
            setUpdatableFlatpaks(data.result);
          }
        });
    }
  }, [])

  return (
    <PanelSection title="Flatpaks">
      <PanelSectionRow>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ButtonItem bottomSeparator="none" onClick={() => {
            setUpdatableFlatpaks({});
            setUpdaterState(UpdateCheckerState.CHECKING);
            PyInterop.getUpdatableFlatpaks()
              .then(data => {
                if (data.success) {
                  setUpdaterState(UpdateCheckerState.IDLE);
                  setUpdatableFlatpaks(data.result);
                }
              });
          }} disabled={updaterState != UpdateCheckerState.IDLE}>
            {updaterState == UpdateCheckerState.IDLE &&
              "Check for updates"
            }
            {updaterState == UpdateCheckerState.CHECKING &&
              "Checking for updates"
            }
          </ButtonItem>
        </div>
      </PanelSectionRow>

      <PanelSectionRow>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {Object.values(flatPaks).length > 0 &&
            <div>
              <b>{Object.values(flatPaks).length}</b> updates available
            </div>
          }
          {updaterState == UpdateCheckerState.CHECKING &&
            <div>
              <SteamSpinner />
            </div>
          }
        </div>
      </PanelSectionRow>

      <PanelSectionRow>
        <div>
          {
            Object.values(flatPaks).map((info) => (
              <div style={{ display: "block", justifyContent: "stretch" }}>
                <ToggleField
                  checked={paksToUpdate[info.appID] !== undefined}
                  label={info.name}
                  onChange={(checked: boolean) => {
                    if (checked) {
                      paksToUpdate[info.appID] = info;
                      console.info('added ' + info.appID)
                      reloadGUI("Added package to update " + info.name)
                    } else {
                      delete paksToUpdate[info.appID];
                      console.info('removed ' + info.appID)
                      reloadGUI("Removed package to update " + info.name)
                    }
                  }} />
              </div>
            ))
          }
        </div>
      </PanelSectionRow>

      {Object.values(flatPaks).length > 0 &&
        <PanelSectionRow>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ButtonItem bottomSeparator="none" onClick={() => {
              setUpdatableFlatpaks({});
              Router.CloseSideMenus();
              Router.Navigate("/apply-updates");
            }} disabled={Object.values(paksToUpdate).length == 0}>Update selected</ButtonItem>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ButtonItem bottomSeparator="none" onClick={() => {
              paksToUpdate = flatPaks;
              setUpdatableFlatpaks({});
              Router.CloseSideMenus();
              Router.Navigate("/apply-updates");
            }}>Update all</ButtonItem>
          </div>
        </PanelSectionRow>
      }
    </PanelSection>
  );
};

const ApplyUpdates: VFC = () => {
  const paksToUpdateList: FlatpakInfo[] = Object.values(paksToUpdate)
  const info: FlatpakInfo | undefined = paksToUpdateList.length > 0 ? paksToUpdateList[0] : undefined
  const [count, setCount] = useState<number>(0);
  const [totalToUpdate, _] = useState<number>(paksToUpdateList.length)

  if (info) {
    PyInterop.updateFlatpak(info.appID, false)
      .then(data => {
        if (data.success) {
          delete paksToUpdate[info.appID]
          setCount(count + 1);
        }
      });
  }

  return (
    <PanelSection title="Updating">
      {info &&
        <PanelSectionRow>
          <div style={{ display: "flex", justifyContent: "center" }}>
            Updating {info.name} <i>({info.appID})</i>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ProgressBar nProgress={(count / totalToUpdate) * 100} />
          </div>
          <div>
            <div style={{ display: "block", justifyContent: "normal" }}>
              <h2>Flatpaks to update</h2>
            </div>
            {
              paksToUpdateList.map((i) => (
                <div style={{ display: "block", justifyContent: "normal" }}>
                  {i.name}
                </div>
              ))
            }
          </div>
        </PanelSectionRow>
      }
      {info === undefined && count > 0 &&
        <PanelSectionRow>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <i>Updated <b>{count}</b> flatpaks!</i>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ProgressBar nProgress={(count / totalToUpdate) * 100} />
          </div>
        </PanelSectionRow>
      }
    </PanelSection >
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  PyInterop.setServer(serverApi);
  serverApi.routerHook.addRoute("/apply-updates", ApplyUpdates, {
    exact: true,
  });

  return {
    title: <div className={staticClasses.Title}>Flatpak Updater</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaBuffer />,
    onDismount() {
      serverApi.routerHook.removeRoute("/apply-updates");
    },
  };
});
