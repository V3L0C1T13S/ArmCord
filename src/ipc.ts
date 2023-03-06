//ipc stuff
import {app, ipcMain, shell, desktopCapturer, nativeImage, screen} from "electron";
import {mainWindow} from "./window";
import {
    setConfigBulk,
    getVersion,
    getConfig,
    setLang,
    getLang,
    getWindowState,
    packageVersion,
    getDisplayVersion,
    modInstallState,
    installModLoader
} from "./utils";
import {customTitlebar} from "./main";
import {createSettingsWindow} from "./settings/main";
import os from "os";
import fs from "fs";
import path from "path";
export function registerIpc() {
    ipcMain.on("get-app-path", (event, arg) => {
        event.reply("app-path", app.getAppPath());
    });
    ipcMain.on("setLang", (event, lang: string) => {
        setLang(lang);
    });
    ipcMain.handle("getLang", (event, toGet: string) => {
        return getLang(toGet);
    });
    ipcMain.on("open-external-link", (event, href: string) => {
        shell.openExternal(href);
    });
    ipcMain.on("setPing", (event, pingCount: number) => {
        switch (os.platform()) {
            case "linux" ?? "macos":
                app.setBadgeCount(pingCount);
                break;
            case "win32":
                if (pingCount > 0) {
                    var image = nativeImage.createFromPath(path.join(__dirname, "../", `/assets/ping.png`));
                    mainWindow.setOverlayIcon(image, "badgeCount");
                } else {
                    mainWindow.setOverlayIcon(null, "badgeCount");
                }
                break;
        }
    });
    ipcMain.on("win-maximize", (event, arg) => {
        mainWindow.maximize();
    });
    ipcMain.on("win-isMaximized", (event, arg) => {
        event.returnValue = mainWindow.isMaximized();
    });
    ipcMain.on("win-isNormal", (event, arg) => {
        event.returnValue = mainWindow.isNormal();
    });
    ipcMain.on("win-minimize", (event, arg) => {
        mainWindow.minimize();
    });
    ipcMain.on("win-unmaximize", (event, arg) => {
        mainWindow.unmaximize();
    });
    ipcMain.on("win-show", (event, arg) => {
        mainWindow.show();
    });
    ipcMain.on("win-hide", (event, arg) => {
        mainWindow.hide();
    });
    ipcMain.on("win-quit", (event, arg) => {
        app.exit();
    });
    ipcMain.on("get-app-version", (event) => {
        event.returnValue = getVersion();
    });
    ipcMain.on("displayVersion", (event) => {
        event.returnValue = getDisplayVersion();
    });
    ipcMain.on("modInstallState", (event) => {
        event.returnValue = modInstallState;
    });
    ipcMain.on("get-package-version", (event) => {
        event.returnValue = packageVersion;
    });
    ipcMain.on("splashEnd", async () => {
        try {
            var width = (await getWindowState("width")) ?? 800;
            var height = (await getWindowState("height")) ?? 600;
            var isMaximized = (await getWindowState("isMaximized")) ?? false;
            var xValue = await getWindowState("x");
            var yValue = await getWindowState("y");
        } catch (e) {
            console.log("[Window state manager] No window state file found. Fallbacking to default values.");
            mainWindow.setSize(800, 600);
        }
        if (isMaximized) {
            mainWindow.setSize(800, 600); //just so the whole thing doesn't cover whole screen
            mainWindow.maximize();
        } else {
            mainWindow.setSize(width, height);
            mainWindow.setPosition(xValue, yValue);
            console.log("[Window state manager] Not maximized.");
        }
    });
    ipcMain.on("restart", (event, arg) => {
        app.relaunch();
        app.exit();
    });
    ipcMain.on("saveSettings", (event, args) => {
        setConfigBulk(args);
    });
    ipcMain.on("minimizeToTray", async (event) => {
        event.returnValue = await getConfig("minimizeToTray");
    });
    ipcMain.on("channel", async (event) => {
        event.returnValue = await getConfig("channel");
    });
    ipcMain.on("clientmod", async (event, arg) => {
        event.returnValue = await getConfig("mods");
    });
    ipcMain.on("legacyCapturer", async (event, arg) => {
        event.returnValue = await getConfig("useLegacyCapturer");
    });
    ipcMain.on("trayIcon", async (event, arg) => {
        event.returnValue = await getConfig("trayIcon");
    });
    ipcMain.on("disableAutogain", async (event, arg) => {
        event.returnValue = await getConfig("disableAutogain");
    });
    ipcMain.on("titlebar", (event, arg) => {
        event.returnValue = customTitlebar;
    });
    ipcMain.on("mobileMode", async (event, arg) => {
        event.returnValue = await getConfig("mobileMode");
    });
    ipcMain.on("shouldPatch", async (event, arg) => {
        event.returnValue = await getConfig("automaticPatches");
    });
    ipcMain.on("openSettingsWindow", (event, arg) => {
        createSettingsWindow();
    });
    ipcMain.on("setting-armcordCSP", async (event) => {
        if (await getConfig("armcordCSP")) {
            event.returnValue = true;
        } else {
            event.returnValue = false;
        }
    });
    ipcMain.on("discord-get-os-name", (event) => {
        // FIXME: we should probably spoof non-standard OS names (ex. freebsd),
        // otherwise we could leak that we're using an unofficial client
        event.returnValue = os.platform();
    });
    ipcMain.on("discord-get-os-release", (event) => {
        event.returnValue = os.release();
    });
    ipcMain.on("discord-get-os-arch", (event) => {
        event.returnValue = os.arch();
    });
    ipcMain.on("discord-get-cpu-core-count", (event) => {
        event.returnValue = os.cpus().length;
    });
    ipcMain.on("discord-get-memory-usage-kb", (event) => {
        event.returnValue = process.memoryUsage().heapUsed;
    });
    ipcMain.handle("DESKTOP_CAPTURER_GET_SOURCES", (event, opts) => desktopCapturer.getSources(opts));
}
