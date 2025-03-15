import { ApiPromise, WsProvider } from "@polkadot/api";
import { RPC_CONFIG, RPC_TYPES } from "../constants/RpcConfs";
import Table from "../components/Table";
import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import { Link } from "react-router-dom";
const { Keyring } = require("@polkadot/keyring");

const Bounty = () => {
  const [activeBounties, setActiveBounties] = useState([]);
  const [historicalBounties, setHistoricalBounties] = useState([]);
  const [loadingActive, setLoadingActive] = useState(true);
  const [loadingHistorical, setLoadingHistorical] = useState(true);
  const [totalBounties, setTotalBounties] = useState ("");
  const [countActive, setCountActive] = useState("");

  const decimalsP3D = 1_000_000_000_000;
  const suffixP3D = "P3D";

  useEffect(() => {
    const fetchActiveBounties = async () => {
      setLoadingActive(true);
      try {
        const wsProvider = new WsProvider("wss://rpc.3dpscan.io");
        const api = await ApiPromise.create({
          provider: wsProvider,
          types: RPC_TYPES,
          rpc: RPC_CONFIG,
        });

        const activeBountyEntries = await api.query.bounties.bounties.entries();
        
        const totalBounties = await api.query.bounties.bountyCount();

        setTotalBounties(totalBounties.toHuman());
        
        const formattedActiveBounties = [];

        for (const [key, value] of activeBountyEntries) {
          const bounty = value.toHuman();
          const proposerName = await fetchIdentity(api, bounty.proposer);
          const activeDescription = await api.query.bounties.bountyDescriptions(key.args[0].toNumber());
          const description = activeDescription.toHuman();

          let statusText = "-";
          if (typeof bounty.status === "string") {
            statusText = bounty.status;
          } else if (
            typeof bounty.status === "object" &&
            bounty.status.Active
          ) {
            const curatorName = await fetchIdentity(
              api,
              bounty.status.Active.curator
            );
            statusText = `Active; Curator: ${curatorName}`;
          }

          formattedActiveBounties.push([
            {
              val: (
                <Link>
                  {key.args[0].toNumber()}
                </Link>
              ),
            },
            { val: proposerName },
            {
              val: bounty.value
                ? `${(
                    parseInt(bounty.value.replace(/,/g, "")) / decimalsP3D
                  ).toFixed(4)} ${suffixP3D}`
                : `0.0000 ${suffixP3D}`,
            },
            {
              val: description.length > 30 ? (
                <span title={description}>{description.substring(0, 30)}...</span>
              ) : (
                description
              ),
            },
            {
              val: bounty.curatorDeposit
                ? `${(
                    parseInt(bounty.curatorDeposit.replace(/,/g, "")) /
                    decimalsP3D
                  ).toFixed(4)} ${suffixP3D}`
                : `0.0000 ${suffixP3D}`,
            },
            {
              val: bounty.bond
                ? `${(
                    parseInt(bounty.bond.replace(/,/g, "")) / decimalsP3D
                  ).toFixed(4)} ${suffixP3D}`
                : `0.0000 ${suffixP3D}`,
            },
            { val: statusText },
          ]);
        }

        formattedActiveBounties.sort((a, b) => {
          const idA = parseInt(a[0].val.props.children);
          const idB = parseInt(b[0].val.props.children);
          return idB - idA;
        });

        setActiveBounties(formattedActiveBounties);
        setCountActive(formattedActiveBounties.length);

      } catch (error) {
      } finally {
        setLoadingActive(false);
      }
    };

    fetchActiveBounties();
  }, []);

  useEffect(() => {
    const fetchHistoricalBounties = async () => {
      setLoadingHistorical(true);
      const wsProvider = new WsProvider("wss://rpc.3dpscan.io");
      const api = await ApiPromise.create({
        provider: wsProvider,
        types: RPC_TYPES,
        rpc: RPC_CONFIG,
      });
  
      try {
        const graphqlQuery = {
          query: `{
            getEvents(pageKey:"1", pageSize:1000, filters:{ eventModule:"Bounties"} ) {
              objects {
                eventName
                attributes
                blockNumber
                extrinsicIdx
                blockDatetime
              }
            }
          }`,
        };
  
        const response = await axiosInstance.post("", graphqlQuery);
        const events = response.data.data.getEvents.objects;
  
        const activeBountyIds = activeBounties.map(
          (bounty) => Number(bounty[0]?.val.props.children)
        );
  
        const bountyEventsMap = new Map();
  
        events.forEach((event) => {
          let bountyId;
          try {
            const parsedAttributes = JSON.parse(event.attributes);
            bountyId = Array.isArray(parsedAttributes) ? parsedAttributes[0] : parsedAttributes;
          } catch (error) {
            bountyId = parseInt(event.attributes); 
          }
  
          if (!bountyEventsMap.has(bountyId)) {
            bountyEventsMap.set(bountyId, []);
          }
          bountyEventsMap.get(bountyId).push(event);
        });
  
        const bountyIds = [...bountyEventsMap.keys()].filter((bountyId) => !activeBountyIds.includes(bountyId));
  
        const proposerPromises = bountyIds.map(async (bountyId) => {
          const proposedEvent = bountyEventsMap.get(bountyId).find(e => e.eventName === "BountyProposed");
          if (!proposedEvent) return { bountyId, proposer: "-" };
  
          const extrinsicQuery = {
            query: `{
              getExtrinsic(filters:{ callModule: "Bounties", callName: "propose_bounty", blockNumber: ${proposedEvent.blockNumber}, extrinsicIdx: ${proposedEvent.extrinsicIdx} }) {
                multiAddressAccountId
                callArguments
              }
            }`,
          };
  
          const extrinsicResponse = await axiosInstance.post("", extrinsicQuery);
          const proposerAddress = extrinsicResponse.data.data.getExtrinsic.multiAddressAccountId;
          const keyring = new Keyring();
          const encodedProposer = keyring.encodeAddress(proposerAddress, 71);
          const proposer = await fetchIdentity(api, encodedProposer);
  
          return { bountyId, proposer, description: JSON.parse(extrinsicResponse.data.data.getExtrinsic.callArguments).find(arg => arg.name === "description")?.value || "N/A" };
        });
  
        const claimedByPromises = bountyIds.map(async (bountyId) => {
          const claimedEvent = bountyEventsMap.get(bountyId).find(e => e.eventName === "BountyClaimed");
          if (!claimedEvent) return { bountyId, claimedBy: "-", amount: "0.0000 P3D" };
  
          try {
            const claimedData = JSON.parse(claimedEvent.attributes);
            const keyring = new Keyring();
            const address = keyring.encodeAddress(claimedData[2], 71);
            const claimedBy = await fetchIdentity(api, address);
            const amount = `${(parseInt(String(claimedData[1]).replace(/,/g, "")) / decimalsP3D).toFixed(4)} ${suffixP3D}`;
            return { bountyId, claimedBy, amount };
          } catch (err) {
            //console.error(`Error parsing claim data for bounty ${bountyId}:`, err);
            return { bountyId, claimedBy: "-", amount: "0.0000 P3D" };
          }
        });
  
        const proposerResults = await Promise.all(proposerPromises);
        const claimedByResults = await Promise.all(claimedByPromises);
  
        const proposerMap = {};
        proposerResults.forEach(({ bountyId, proposer, description }) => {
          proposerMap[bountyId] = { proposer, description };
        });
  
        const claimedByMap = {};
        claimedByResults.forEach(({ bountyId, claimedBy, amount }) => {
          claimedByMap[bountyId] = { claimedBy, amount };
        });
  
        const historicalData = bountyIds.map(bountyId => {
          const bountyEvents = bountyEventsMap.get(bountyId);
          const { proposer, description } = proposerMap[bountyId] || { proposer: "-", description: "N/A" };
          const { claimedBy, amount } = claimedByMap[bountyId] || { claimedBy: "-", amount: "0.0000 P3D" };
  
          let statusText = "Proposed";
          if (bountyEvents.find((e) => e.eventName === "BountyRejected")) {
            statusText = "Rejected";
          }
          if (bountyEvents.find((e) => e.eventName === "BountyClaimed")) {
            statusText = "Claimed";
          }
  
          return [
            { val: <Link>{bountyId}</Link> },
            { val: proposer },
            {
              val: description.length > 30 ? (
                <span title={description}>{description.substring(0, 30)}...</span>
              ) : (
                description
              ),
            },
            { val: amount },
            { val: claimedBy },
            { val: statusText },
          ];
        });

        historicalData.sort((a, b) => {
          const idA = parseInt(a[0].val.props.children);
          const idB = parseInt(b[0].val.props.children);
          return idB - idA;
        });
  
        setHistoricalBounties(historicalData);
      } catch (error) {
        //console.error("Error fetching historical bounties:", error);
      } finally {
        setLoadingHistorical(false);
      }
    };
  
    fetchHistoricalBounties();
  }, [activeBounties]);
  

  const fetchIdentity = async (api, address) => {
    
    if (!address) return "-";
    try {
      const identity = await api.query.identity.identityOf(address);
      if (identity.isSome) {
        const identityData = identity.toHuman();
        const displayName = identityData.info?.display?.Raw;
        let discordName = null;

        if (identityData.info?.additional) {
          const discordEntry = identityData.info.additional.find(
            (entry) => entry[0].Raw === "Discord"
          );
          discordName = discordEntry ? discordEntry[1].Raw : null;
        }

        return displayName || discordName || address;
      } else {
        return address;
      }
    } catch (error) {
      //console.error(`Error fetching identity for ${address}:`, error);
      return address;
    }
  };

  return (
    <React.Fragment>
      <div className="page-title">Bounties #Total Bounties {totalBounties}</div>

      <h2>Active Bounties ({countActive})</h2>
      {loadingActive ? (
        <div>Loading active bounties...</div>
      ) : (
        <Table
          header={[
            "Bounty ID",
            "Proposer",
            "Value",
            "Description",
            "Curator Deposit",
            "Bond",
            "Status",
          ]}
          array={activeBounties}
        />
      )}

      <h2>Historical Bounties ({totalBounties - countActive}) </h2>
      {loadingHistorical ? (
        <div>Loading historical bounties...</div>
      ) : (
        <Table
          header={[
            "Bounty ID",
            "Proposed",
            "Description",
            "Amount",
            "Claimed By",
            "Status",
          ]}
          array={historicalBounties}
        />
      )}
    </React.Fragment>
  );
};

export default Bounty;
