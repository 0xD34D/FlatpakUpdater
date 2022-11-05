import {
  ButtonItem,
  definePlugin,
  DialogButton,
  Menu,
  MenuItem,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  showContextMenu,
  staticClasses,
  TextField,
} from "decky-frontend-lib";
import { PyInterop } from "./PyInterop";
import { useEffect, useState, VFC } from "react";
import { FaShip } from "react-icons/fa";
import logo from "../assets/logo.png";

const Content: VFC<{ serverAPI: ServerAPI }> = ({ }) => {
  const [adder, setResult] = useState<number>();
  const [flatPaks, setInstalledFlatpaks] = useState<string[]>();

  useEffect(() => {
    PyInterop.add(2, 40)
      .then(data => {
        if (data.success) {
          setResult(data.result);
        }
      });
    PyInterop.getInstalledFlatpaks()
      .then(data => {
        if (data.success) {
          setInstalledFlatpaks(data.result);
        }
      });
  }, [])

  return (
    <PanelSection title="Panel Section">
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={(e) =>
            showContextMenu(
              <Menu label="Menu" cancelText="CAAAANCEL" onCancel={() => { }}>
                <MenuItem onSelected={() => { }}>Item #1</MenuItem>
                <MenuItem onSelected={() => { }}>Item #2</MenuItem>
                <MenuItem onSelected={() => { }}>Item #3</MenuItem>
              </Menu>,
              e.currentTarget ?? window
            )
          }
        >
          Server says *{adder}*
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img src={logo} />
        </div>
      </PanelSectionRow>

      <PanelSectionRow>
        <TextField value="Testing" />
        {
          flatPaks?.flatMap((itm: string) => (
            <div>{itm}</div>
          ))
        }
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            Router.CloseSideMenus();
            Router.Navigate("/decky-plugin-test");
          }}
        >
          Router
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};

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
    title: <div className={staticClasses.Title}>Flatpak Updater Plugin</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaShip />,
    onDismount() {
      serverApi.routerHook.removeRoute("/decky-plugin-test");
    },
  };
});
