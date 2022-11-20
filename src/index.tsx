import {
  definePlugin,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  staticClasses,
  ToggleField,
  ButtonItem,
  ProgressBar,
  Spinner,
} from "decky-frontend-lib";
import { PyInterop } from "./PyInterop";
import { useState, VFC } from "react";
import { FaBuffer } from "react-icons/fa";
import { FlatpakInfo } from "./FlatpakInfo";

enum UpdateCheckerState {
  IDLE = 0,
  CHECKING,
}

var paksToUpdate: FlatpakInfo[] = [];

const Content: VFC<{ serverAPI: ServerAPI }> = ({ }) => {
  const [flatPaks, setUpdatableFlatpaks] = useState<FlatpakInfo[]>([]);
  const [_, reloadGUI] = useState<any>("");
  const [updaterState, setUpdaterState] = useState<UpdateCheckerState>(UpdateCheckerState.IDLE);
  if (flatPaks.length == 0) {
    paksToUpdate = [];
  }

  return (
    <PanelSection title="Flatpaks">
      <PanelSectionRow>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ButtonItem bottomSeparator="none" onClick={() => {
            setUpdatableFlatpaks([]);
            setUpdaterState(UpdateCheckerState.CHECKING);
            PyInterop.getUpdatableFlatpaks()
              .then(data => {
                if (data.success) {
                  setUpdaterState(UpdateCheckerState.IDLE);
                  setUpdatableFlatpaks(Object.values(data.result));
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
          {flatPaks.length > 0 &&
            <div>
              <b>{flatPaks.length}</b> updates available
            </div>
          }
          {updaterState == UpdateCheckerState.CHECKING &&
            <div>
              <Spinner width="96px" height="96px" />
            </div>
          }
        </div>
      </PanelSectionRow>

      <PanelSectionRow>
        <div>
          {
            flatPaks.map((info) => (
              <div style={{ display: "block", justifyContent: "stretch" }}>
                <ToggleField
                  checked={paksToUpdate[info.appID] !== undefined}
                  label={info.name}
                  onChange={(checked: boolean) => {
                    if (checked) {
                      paksToUpdate.push(info);
                      console.info('added ' + info.appID)
                      reloadGUI("Added package to update " + info.name)
                    } else {
                      var N = paksToUpdate.length;
                      for (var i: number = 0; i < N; i++) {
                        if (info.appID == paksToUpdate[i].appID) {
                          paksToUpdate.splice(i, 1);
                          console.info('removed ' + info.appID)
                          break;
                        }
                      }
                      reloadGUI("Removed package to update " + info.name)
                    }
                  }} />
              </div>
            ))
          }
        </div>
      </PanelSectionRow>

      {flatPaks.length > 0 &&
        <PanelSectionRow>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ButtonItem bottomSeparator="none" onClick={() => {
              setUpdatableFlatpaks([]);
              Router.CloseSideMenus();
              Router.Navigate("/apply-updates");
            }} disabled={paksToUpdate.length == 0}>Update selected</ButtonItem>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ButtonItem bottomSeparator="none" onClick={() => {
              paksToUpdate = flatPaks;
              setUpdatableFlatpaks([]);
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
  const info: FlatpakInfo | undefined = paksToUpdate.length > 0 ? paksToUpdate[0] : undefined
  const [count, setCount] = useState<number>(0);
  const [totalToUpdate, _] = useState<number>(paksToUpdate.length)

  if (info) {
    PyInterop.updateFlatpak(info.appID, false)
      .then(data => {
        if (data.success) {
          paksToUpdate.splice(0, 1);
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
              paksToUpdate.map((i) => (
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
