import WebSocket, { WebSocketServer } from 'ws';

export default (expressServer) => {
  const websocketServer = new WebSocketServer({
    noServer: true,
    path: "/ws",
    // perMessageDeflate: {
    //   zlibDeflateOptions: {
    //     // See zlib defaults.
    //     chunkSize: 1024,
    //     memLevel: 7,
    //     level: 3
    //   },
    //   zlibInflateOptions: {
    //     chunkSize: 10 * 1024
    //   },
    //   // Other options settable:
    //   clientNoContextTakeover: true, // Defaults to negotiated value.
    //   serverNoContextTakeover: true, // Defaults to negotiated value.
    //   serverMaxWindowBits: 10, // Defaults to negotiated value.
    //   // Below options specified as default values.
    //   concurrencyLimit: 8, // Limits zlib concurrency for perf.
    //   threshold: 1024 // Size (in bytes) below which messages
    //   // should not be compressed if context takeover is disabled.
    // }
  });

  expressServer.on("upgrade", (request, socket, head) => {
    websocketServer.handleUpgrade(request, socket, head, (websocket) => {
      websocketServer.emit("connection", websocket, request);
    });
  });

  return websocketServer;
};


