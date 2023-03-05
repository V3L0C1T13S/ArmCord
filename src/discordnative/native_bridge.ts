import {contextBridge, ipcRenderer} from "electron";
import {armcordNative} from "../preload/bridge";

const stub = (name: string) => () => `stub! ${name}`;
export function initializeNativeBridge() {
    contextBridge.exposeInMainWorld("discordNative", {
        isRenderer: !!ipcRenderer,
        nativeModules: {
            canBootstrapNewUpdater: true,
            ensureModule: stub("ensureModule"),
            requireModule: stub("requireModule")
        },
        process: {
            platform: "linux",
            arch: "x64",
            env: {
                DISCORD_DISALLOW_POPUPS: undefined,
                DISCORD_GATEWAY_PLAINTEXT: undefined,
                DISCORD_TEST: undefined,
                LOCALAPPDATA: undefined,
                PROGRAMDATA: undefined,
                PROGRAMFILES: undefined,
                "PROGRAMFILES(X86)": undefined,
                PROGRAMW6432: undefined
            }
        },
        os: {
            release: "5.19.0-35-generic",
            arch: "x64"
        },
        app: {
            dock: {
                bounce: stub("bounce"),
                getBuildNumber: stub("getBuildNumber"),
                getDefaultDoubleClickAction: stub("getDefaultDoubleClickAction"),
                getModuleVersions: stub("getModuleVersions"),
                getPath: stub("getPath"),
                getReleaseChannel: stub("getReleaseChannel"),
                getVersion: stub("getVersion"),
                registerUserInteractionHandler: stub("registerUserInteractionHandler"),
                relaunch: stub("relaunch"),
                setBadgeCount: stub("setBadgeCount")
            },
            getBuildNumber: () => null,
            getVersion: () => "0.0.25",
            getModuleVersions: () => ({
                discord_desktop_core: 1,
                discord_erlpack: 1,
                discord_spellcheck: 1,
                discord_utils: 1,
                discord_voice: 1,
                discord_krisp: 1,
                discord_game_utils: 1,
                discord_rpc: 1
            }),
            getReleaseChannel: () => "stable"
        },
        clipboard: {
            copy: stub("copy"),
            copyImage: stub("copyImage"),
            cut: stub("cut"),
            paste: stub("paste"),
            read: stub("read")
        },
        ipc: {
            invoke: stub("invoke"),
            on: stub("on"),
            send: stub("send")
        },
        gpuSettings: {
            getEnableHardwareAcceleration: async () => true,
            setEnableHardwareAcceleration: stub("setEnableHardwareAcceleration")
        },
        window: {
            USE_OSX_NATIVE_TRAFFIC_LIGHTS: true,
            maximize: async () => armcordNative.window.maximize(),
            minimize: async () => armcordNative.window.minimize(),
            restore: async () => {}
        },
        powerMonitor: {},
        spellCheck: {},
        crashReporter: {},
        desktopCapture: {},
        fileManager: {},
        clips: {},
        processUtils: {
            flushCookies: stub("flushCookies"),
            flushDNSCache: stub("flushDNSCache"),
            flushStorageData: stub("flushStorageData"),
            getCPUCoreCount: stub("getCPUCoreCount"),
            getCurrentCPUUsagePercent: stub("getCurrentCPUUsagePercent"),
            getCurrentMemoryUsageKB: stub("getCurrentMemoryUsageKB"),
            getLastCrash: stub("getLastCrash"),
            getMainArgvSync: stub("getMainArgvSync"),
            purgeMemory: stub("purgeMemory")
        },
        powerSaveBlocker: {},
        http: {
            getAPIEndpoint: () => "https://discord.com/api"
        },
        accessibility: {},
        features: {
            supports: () => false
        },
        settings: {},
        userDataCache: {},
        thumbar: {},
        safeStorage: {},
        remoteApp: {
            dock: {}
        },
        remotePowerMonitor: {}
    });
    contextBridge.exposeInMainWorld("discordVideo", stub("discordVideo"));
}
