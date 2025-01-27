import Worker from "./worker?worker";

let worker: Worker;
let controller: AbortController;

/**
 * Loads the CharMap
 */
export async function load() {
  try {
    controller = new AbortController();
    worker = new Worker({
      type: "module",
      name: "ICMC Emulator Worker",
    });

    const isReady = Promise.withResolvers<void>();

    worker.addEventListener(
      "message",
      (event: MessageEvent<string>) => {
        if (event.data === "ready") {
          isReady.resolve();
        } else {
          isReady.reject(new Error("Invalid message"));
        }
      },
      {
        once: true,
        signal: controller.signal,
      },
    );

    await Promise.all([isReady.promise]);

    // Only add the event listener after the worker is ready
    worker.addEventListener(
      "message",
      (event: MessageEvent) => {
        console.log("[EXTENSION][ICMC] Worker message: ", event.data);
        // TODO: handle messages
      },
      {
        signal: controller.signal,
      },
    );

    console.log("[EXTENSION][ICMC] Loaded");
  } catch (error) {
    controller.abort();
    console.error("[EXTENSION][ICMC] Could not load: ", error);
  }
}

export function unload() {
  controller.abort();
  controller = undefined;

  worker.terminate();
  worker = undefined;

  console.log("[EXTENSION][ICMC] Unloaded");
}

export function query(uri: URL) {
  switch (uri.pathname) {
    case "/emulator":
      return document.createElement("x-base-activities");

    default:
      console.log("[EXTENSION][ICMC] Unknown request: ", uri);
  }
}
