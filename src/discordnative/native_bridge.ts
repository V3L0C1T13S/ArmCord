import {contextBridge, ipcRenderer} from "electron";
import {armcordNative} from "../preload/bridge";
import {eventEmitter} from "./event";
import {stub, todo} from "./util";

export function initializeNativeBridge() {
    const app = {
        dock: {
            bounce: todo("bounce"),
            getBuildNumber: stub("getBuildNumber"),
            getDefaultDoubleClickAction: stub("getDefaultDoubleClickAction"),
            getModuleVersions: stub("getModuleVersions"),
            getPath: stub("getPath"),
            getReleaseChannel: stub("getReleaseChannel"),
            getVersion: stub("getVersion"),
            registerUserInteractionHandler: todo("registerUserInteractionHandler"),
            relaunch: todo("relaunch"),
            setBadgeCount: todo("setBadgeCount")
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
    };
    const powerMonitor = {
        getSystemIdleTimeMs: () => {
            return 0;
        },

        on: (event: string) => {
            console.log("power monitor event:", event);
        },

        removeAllListeners: () => {},

        removeListener: () => {}
    };
    const discordUtils = {
        setGameCandidateOverrides: stub("setGameCandidateOverrides"),
        inputGetIdleMilliseconds: () => 0
    };
    const discordNative = {
        isRenderer: !!ipcRenderer,
        nativeModules: {
            canBootstrapNewUpdater: true,
            ensureModule: async (name: string) => {
                console.log("returning for module", name);
            },
            requireModule: (name: string) => {
                switch (name) {
                    case "discord_game_utils": {
                        return discordUtils;
                    }
                    case "discord_utils": {
                        return discordUtils;
                    }
                    case "discord_erlpack": {
                        return {};
                    }
                    case "discord_rpc": {
                        // TODO: Integrate with ARRPC?
                        const rpcHttp = {
                            ...new eventEmitter()
                        };
                        const rpcWs = {
                            ...new eventEmitter()
                        };
                        const rpcNet = {
                            ...new eventEmitter()
                        };
                        return {
                            RPCWebSocket: {
                                http: {
                                    createServer: () => rpcHttp
                                },
                                ws: {
                                    Server: () => rpcWs
                                },
                                net: {
                                    createServer: () => rpcNet
                                }
                            }
                        };
                    }
                    default: {
                        console.log("unimplemented module", name);
                        break;
                    }
                }
            }
        },
        process: {
            platform: ipcRenderer.sendSync("discord-get-os-name"),
            arch: ipcRenderer.sendSync("discord-get-os-arch"),
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
            release: ipcRenderer.sendSync("discord-get-os-release"),
            arch: ipcRenderer.sendSync("discord-get-os-arch")
        },
        app,
        clipboard: {
            copy: stub("copy"),
            copyImage: stub("copyImage"),
            cut: stub("cut"),
            paste: stub("paste"),
            read: stub("read")
        },
        ipc: {
            invoke: todo("ipc.invoke"),
            on: todo("ipc.on"),
            send: (event: string, ...args: any) => {
                switch (event) {
                    default: {
                        console.log("unhandled discordnative ipc.send", event, ...args);
                        break;
                    }
                }
            }
        },
        gpuSettings: {
            getEnableHardwareAcceleration: async () => true,
            setEnableHardwareAcceleration: todo("setEnableHardwareAcceleration")
        },
        window: {
            USE_OSX_NATIVE_TRAFFIC_LIGHTS: true,
            maximize: async () => armcordNative.window.maximize(),
            minimize: async () => armcordNative.window.minimize(),
            restore: async () => {},
            setZoomFactor: async (...args: any) => {
                console.log("set zoom factor", ...args);
            },
            setBackgroundThrottling: async (...args: any) => {
                console.log("unimplemented background throttle", ...args);
            },
            setDevtoolsCallbacks: async (...args: any) => {
                console.log("unimplemented setDevtoolsCallbacks", ...args);
            }
        },
        powerMonitor,
        spellCheck: {},
        crashReporter: {
            getMetadata: () => ({
                email: "fixme_email@127.0.0.1",
                nativeBuildNumber: "null",
                sentry: {
                    user: {
                        email: "fixme_email@127.0.0.1",
                        id: "0",
                        username: "fixme_username"
                    }
                },
                user_id: "0",
                username: "fixme_username"
            }),
            updateCrashReporter: stub("updateCrashReporter")
        },
        desktopCapture: {},
        fileManager: {},
        clips: {},
        processUtils: {
            flushCookies: stub("flushCookies"),
            flushDNSCache: stub("flushDNSCache"),
            flushStorageData: stub("flushStorageData"),
            getCPUCoreCount: () => ipcRenderer.sendSync("discord-get-cpu-core-count"),
            getCurrentCPUUsagePercent: stub("getCurrentCPUUsagePercent"),
            getCurrentMemoryUsageKB: () => ipcRenderer.sendSync("discord-get-memory-usage-kb"),
            getLastCrash: stub("getLastCrash"),
            getMainArgvSync: stub("getMainArgvSync"),
            purgeMemory: stub("purgeMemory")
        },
        powerSaveBlocker: {
            cleanupDisplaySleep: async (...args: any) => {
                console.log("cleanup display sleep", ...args);
            }
        },
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
        safeStorage: {
            isEncryptionAvailable: () => false,
            decryptString: (str: string) => str,
            encryptString: (str: string) => str
        },
        remoteApp: app,
        remotePowerMonitor: powerMonitor
    };
    contextBridge.exposeInMainWorld("DiscordNative", discordNative);
    contextBridge.exposeInMainWorld("discordVideo", todo("discordVideo"));
}
