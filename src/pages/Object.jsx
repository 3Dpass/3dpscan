import { ApiPromise, WsProvider } from "@polkadot/api";
import { RPC_CONFIG, RPC_TYPES } from "../constants/RpcConfs";
import ThreeJSRenderer from "../components/ThreeJSRenderer";
import React, { useEffect, useState } from "react";
import axios from "axios";

import ListInfo from "../components/ListInfo";
import { useParams } from "react-router-dom";

const Object = () => {
  const { number } = useParams();
  const [objects, setObjects] = useState(null);
  const [object3d, setObject3D] = useState("");

  useEffect(() => {
    const getObject = async (number) => {
      const wsProvider = new WsProvider("wss://rpc.3dpscan.io");
      const api = await ApiPromise.create({
        provider: wsProvider,
        types: RPC_TYPES,
        rpc: RPC_CONFIG,
      });
      
      const objects = await api.query.poScan.objects(number);

      const response = await axios.post(
        "https://prod-api.3dpscan.io:4000/object/getObject",
        {
          number: number,
        }
      );
      
      const dataObj = response.data.result.obj;

      let decodedString = new TextDecoder("utf-8").decode(
        new Uint8Array(dataObj)
      );

      const humanObjects = objects.toHuman();

      setObjects(humanObjects);
      
      setObject3D(decodedString.toString());
    };

    getObject(number);
  }, [number]);

  function downloadObjFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
  
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
   
  return (
    <React.Fragment>
      <div className="page-title">OBJECT {number}</div>
      <div className="info-holder"></div>
      {objects && (
        <div className="info-holder">
          <ListInfo title={"State"} info={JSON.stringify(objects.state)} />
          <ListInfo title={"Object"} info={objects.obj} canCopy={true} />
          {object3d && (
            <div className="object-container">
              <ThreeJSRenderer objString={object3d} />
            </div>
          )}
          <ListInfo
            title={"Object Download"}
            info={
              <button onClick={() => downloadObjFile(object3d, "object3d.obj")}>
                Download .obj file
              </button>
            }
          />
          <ListInfo title={"Category"} info={objects.category.Objects3D} />
          {objects.hashes && (
            <ListInfo
              title={"Hashes"}
              info={JSON.stringify(objects.hashes, null, 2)}
              isCode={true}
            />
          )}
          <ListInfo title={"isPrivate"} info={String(objects.isPrivate)} />
          <ListInfo title={"When created"} info={objects.whenCreated ?? "-"} />
          <ListInfo
            title={"When approved"}
            info={objects.whenApproved ?? "-"}
          />
          <ListInfo title={"Owner"} info={objects.owner ?? "-"} />
          {objects.estimators && (
            <ListInfo
              title={"Estimators"}
              info={JSON.stringify(objects.estimators, null, 2)}
              isCode={true}
            />
          )}
          {objects.estOutliers && (
            <ListInfo
              title={"Outliners"}
              info={JSON.stringify(objects.estOutliers, null, 2)}
              isCode={true}
            />
          )}
          {objects.approvers && (
            <ListInfo
              title={"Approvers"}
              info={JSON.stringify(objects.approvers, null, 2)}
              isCode={true}
            />
          )}
          <ListInfo
            title={"Number Approvals"}
            info={objects.numApprovals ?? "-"}
          />
          <ListInfo title={"Est Rewards"} info={objects.estRewards ?? "-"} />
          <ListInfo
            title={"Author Rewards"}
            info={objects.authorRewards ?? "-"}
          />
          {objects.prop && (
            <ListInfo
              title={"Prop"}
              info={JSON.stringify(objects.prop, null, 2)}
              isCode={true}
            />
          )}
        </div>
      )}
    </React.Fragment>
  );
};

export default Object;
