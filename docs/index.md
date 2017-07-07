Client:
  remote config   (ask dest for config options, via transport)
  interface       (data collection)
  serializer      (rearrange source for transport)
  transport       (protocol, socket, xhr, etc)

Server:
  options         (respond to remote config requests)
  dial tone       (intake/transport protocol)
  ingest          (deserialize data from dialtone)
  stream
    fs            (compress for storage and write to disk)
    forward       (send to another protocol)

Client interface

  init new interface

  ```
  Telem.Config(options);
  let interface = Telem.interfaces.MobileGyro(options, updateFn)
  interface.update(data); // Manually add data to queue
  interface.keyframe(data); // Manually render keyframe
  ```

We want to be able to

```
Telem.interfaces.timer.pipe(Telem.transports.console);
```

Client transport
  ```
  let transport = Telem.transports.Local();
  transport.push(data);
  transport.flush();
