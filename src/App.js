import logo from "./logo.svg";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import * as IPFS from "ipfs-core";
import { extract as tarExtract } from "tar-stream";
import { Readable } from "stream-browserify";

const config = {
  preload: {
    enabled: true,
  },
  Addresses: {
    Swarm: [
      "/dns4/star.thedisco.zone/tcp/9090/wss/p2p-webrtc-star",
      "/dns6/star.thedisco.zone/tcp/9090/wss/p2p-webrtc-star",
      "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/",
      "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/",
      "/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/",
    ],
  },
};
const CID = "QmVracrju5M723tsMazcVCe3YTiG3D5TV1powDywLWHSyD";
function App() {
  const ipfsInstance = useRef();
  const imgRef = useRef();
  const [data, setData] = useState(undefined);
  const [load, setLoad] = useState(false);
  async function handelOnClick() {
    console.log(ipfsInstance.current.get, ipfsInstance.current.id());

    const extract = tarExtract();
    const pack = new Readable();
    const files = new Map();
    extract.on("entry", function (header, stream, next) {
      // header is the tar header
      // stream is the content body (might be an empty stream)
      // call next when you are done with this entry
      stream.on("data", function (_data) {
        // console.log("_________file__________", header.name);
        files.set(header.name, _data);
        // console.log(header, _data);
      });

      stream.on("end", function () {
        console.log("end");
        next(); // ready for next entry
      });

      stream.resume(); // just auto drain the stream
    });

    extract.on("finish", function () {
      pack.destroy();
      // setData(files.get(CID));
      imgRef.current.src = URL.createObjectURL(
        new Blob([files.get(CID)], { type: "image/gif" })
      );
    });

    const content = [];
    for await (const file of ipfsInstance.current.get(CID, {
      archive: false,
      compress: false,
    })) {
      content.push(file);
      // console.log(file);
      // console.log(file.path);

      // for await (const chunk of file.content) {
      //   content.push(chunk);
      // }

      // console.log(file);
    }
    console.log(Buffer.concat(content));
    pack.push(Buffer.concat(content));
    pack.push(null);
    pack.pipe(extract);
    // setData(data);
  }
  useEffect(() => {
    IPFS.create(config).then((v) => {
      ipfsInstance.current = v;
      setLoad(true);
    });
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <button disabled={!load} onClick={handelOnClick}>
          Get Data
        </button>
        <img ref={imgRef} />
        <div>{data}</div>
      </header>
    </div>
  );
}

export default App;
