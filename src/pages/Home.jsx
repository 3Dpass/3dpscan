import "../styles/home.css";

import { ApiPromise, WsProvider } from "@polkadot/api";

import { RPC_CONFIG, RPC_TYPES } from "../constants/RpcConfs";
import React, { useEffect, useState } from "react";
import BN from 'bn.js';
import BlockPreview from "../components/BlockPreview";
import { Link } from "react-router-dom";
import TransferPreview from "../components/TransferPreview";
import axios from "axios";
import axiosInstance from "../api/axios";
import axiosHashInstance from "../api/axiosHashApi";

const Home = () => {
  const [blocks, setBlocks] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [latestBlock, setLatestBlock] = useState(0);
  const [totalInsurance, setTotalInsurance] = useState("-");
  const [totalValidators, setTotalValidators] = useState("-");
  const [transfersCount, setTransfersCount] = useState("-");
  const [signedExcintric, setSignedExcintric] = useState("-");
  const [holdersCount, setHoldersCount] = useState("-");
  const [price, setPrice] = useState("-");
  const [totalSupply, setTotalSupply] = useState("-");
  const [circulatingSupply, setCirculatingSupply] = useState("-");
  const [difficulty, setDifficulty] = useState("-");

  useEffect(() => {
    getBlocks();
    checkMissingAssetTransfers();
    getInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getBlocks = async () => {
    const postData = {
      query: `{getBlocks(pageKey: "1", pageSize: 10){pageInfo{pageSize, pageNext, pagePrev}, objects{number, parentNumber, parentHash, stateRoot, hash, datetime, totalWeight, countExtrinsics, countEvents, countLogs, specName}}}`,
    };

    const response = await axiosInstance.post("", postData);
    setBlocks(response.data.data.getBlocks.objects);
    setLatestBlock(response.data.data.getBlocks.objects[0].number);
  };
  const getAssetMetadata = async (assetId) => {
      const wsProvider = new WsProvider("wss://rpc.3dpscan.io");
      const api = await ApiPromise.create({
        provider: wsProvider,
        types: RPC_TYPES,
        rpc: RPC_CONFIG,
      });
    
      const assetDetails = await api.query.poscanAssets.metadata(assetId);
      const metadata = assetDetails.toHuman();
      return metadata;
  };

  const getEventsQuery = async (blockNumber) => {
    const postData = {
      query: `query {
        getEvents(
          pageKey: "1",
          pageSize: 100,
          filters: {
            blockNumber: ${blockNumber},
            eventModule: "PoscanAssets",
            eventName: "Transferred"
          }
        ) {
          objects {
            blockNumber,
            blockDatetime,
            eventIdx,
            extrinsicIdx,
            event,
            eventName,
            eventModule,
            phaseIdx,
            phaseName,
            attributes,
            topics,
            complete
          }
        }
      }`,
    };

    const response = await axiosInstance.post("", postData);
    
    return response.data.data.getEvents.objects;
  };

  const getTransfers = async () => {
    const postData = {
      query: `{getTransfers(pageKey: "1", pageSize: 10) {pageInfo{pageSize, pageNext, pagePrev}, objects{blockNumber, eventIdx, extrinsicIdx, value, blockDatetime, complete, fromMultiAddressType, fromMultiAddressAccountId, toMultiAddressType, toMultiAddressAccountId}}}`,
    };

    const response = await axiosInstance.post("", postData);
    return response.data.data.getTransfers.objects;
  };

  const checkMissingAssetTransfers = async () => {
    const transfers = await getTransfers();

    const blockNumbers = transfers.map((t) => t.blockNumber);
    const minBlockNumber = Math.min(...blockNumbers);
    const maxBlockNumber = Math.max(...blockNumbers);

    const allBlockNumbers = Array.from(
      { length: maxBlockNumber + 1 - minBlockNumber + 1 },
      (_, i) => minBlockNumber + i
    );
        
    const assetTransfers = await Promise.all(
      allBlockNumbers.map(async (blockNumber) => {
        const existingTransfers = transfers.filter(
          (transfer) => transfer.blockNumber === blockNumber
        );
        const events = await getEventsQuery(blockNumber);
  
        const eventTransfers = await Promise.all(
          events.map(async (event) => {
            const [assetId, fromMultiAddressAccountId, toMultiAddressAccountId, rawAmount] = JSON.parse(
              event.attributes
            );
  
            const metadata = await getAssetMetadata(assetId);
  
            return {
              blockNumber: event.blockNumber,
              eventIdx: event.eventIdx,
              extrinsicIdx: event.extrinsicIdx,
              fromMultiAddressAccountId,
              toMultiAddressAccountId,
              value: rawAmount / Math.pow(10, metadata.decimals),
              assetName: metadata.name,
              assetSymbol: metadata.symbol,
              rawAmount,
              blockDatetime: event.blockDatetime,
            };
          })
        );
        return [...existingTransfers, ...eventTransfers];
      })
    );
  
    const enrichedTransfers = assetTransfers.flat();

    const sortedTransfers = enrichedTransfers.sort((a, b) => b.blockNumber - a.blockNumber);
  
    setTransfers(sortedTransfers);
  };

  const getInfo = async () => {
    const wsProvider = new WsProvider("wss://rpc.3dpscan.io");
    const api = await ApiPromise.create({ provider: wsProvider });
    const lol = await api.query.balances.totalIssuance();
    const lolNumber = lol.toHuman().replaceAll(",", "");
    const diff = await api.query.difficulty.currentDifficulty();

    const dividedLol = Number(lolNumber) / 1000000000000;
    const totalInsuranceVal = dividedLol / 1000000;
    const million = new BN('1000000000000', 10);
    const diffconvertBN = await diff.div(million);
    const diffconvert = diffconvertBN.toNumber();
    setTotalInsurance(totalInsuranceVal.toFixed(4));
    setDifficulty(diffconvert.toFixed(4));
    const validators = await axiosHashInstance.get(`/validators`);

    if (validators.data.totalOnlineValidators) {
      setTotalValidators(validators.data.totalOnlineValidators);
    }

    const transfers = await axiosHashInstance.get(`/transfercount`);

    if (transfers.data.totalTransfers) {
      setTransfersCount(transfers.data.totalTransfers);
    }

    const signed = await axiosHashInstance.get(`/signedextrinsiccnt`);

    if (signed.data.totalSignedExtrinsics) {
      setSignedExcintric(signed.data.totalSignedExtrinsics);
    }

    const holders = await axiosHashInstance.get(`/topholdercnt`);

    if (holders.data.count) {
      setHoldersCount(holders.data.count);
    }

    const network = await axios.get("https://wallet.3dpass.org/network");
    const circulatingSupply = network.data.circulatingSupply / 1e12;
    const totalSupply = network.data.totalSupply / 1e12;

    let supplyValue = totalSupply;
    let extensiont = "P3D";

    if (supplyValue >= 1000) {
      supplyValue /= 1000;
      extensiont = "KP3D";
    }

    if (supplyValue >= 1000) {
      supplyValue /= 1000;
      extensiont = "MP3D";
    }

    if (supplyValue >= 1000) {
      supplyValue /= 1000;
      extensiont = "BP3D";
    }

    setTotalSupply(`${supplyValue.toFixed(4)} ${extensiont}`);

    let circValue = circulatingSupply;
    let extension = "P3D";

    if (circValue >= 1000) {
      circValue /= 1000;
      extension = "KP3D";
    }

    if (circValue >= 1000) {
      circValue /= 1000;
      extension = "MP3D";
    }

    if (circValue >= 1000) {
      circValue /= 1000;
      extension = "BP3D";
    }

    setCirculatingSupply(`${circValue.toFixed(3)} ${extension}`);

    const priceInfo = await axios.get(
      "https://api.xeggex.com/api/v2/ticker/P3D_USDT"
    );

    if (priceInfo.data.last_price) {
      setPrice(priceInfo.data.last_price);
    }
    
  };

  return (
    <React.Fragment>
      <div className="home-info-items">
        <div className="line-info-holder">
          <div className="one-home-item">
            <div className="left-info">
              <div className="left-info-icon l-block-icon"></div>
              <div className="left-info-title">Latest Block</div>
            </div>
            <div className="right-value">{latestBlock}</div>
          </div>
          <div className="one-home-item middle-item">
            <div className="left-info">
              <div className="left-info-icon l-signed-icon"></div>
              <div className="left-info-title">Signed Extrinsic</div>
            </div>
            <div className="right-value">{signedExcintric}</div>
          </div>
          <div className="one-home-item">
            <div className="left-info">
              <div className="left-info-icon l-transfer-icon"></div>
              <div className="left-info-title">Transfers</div>
            </div>
            <div className="right-value">{transfersCount}</div>
          </div>
        </div>
        <div className="line-info-holder">
          <div className="one-home-item">
            <div className="left-info">
              <div className="left-info-icon l-holder-icon"></div>
              <div className="left-info-title">Holders</div>
            </div>
            <div className="right-value">{holdersCount}</div>
          </div>
          <div className="one-home-item middle-item">
            <div className="left-info">
              <div className="left-info-icon l-total-icon"></div>
              <div className="left-info-title">Total Issuance</div>
            </div>
            <div className="right-value">{totalInsurance} MP3D</div>
          </div>
          <div className="one-home-item">
            <div className="left-info">
              <div className="left-info-icon l-cirlce-icon"></div>
              <div className="left-info-title">Circulating Supply</div>
            </div>
            <div className="right-value">{circulatingSupply}</div>
          </div>
        </div>
        <div className="line-info-holder">
          <div className="one-home-item">
            <div className="left-info">
              <div className="left-info-icon l-validators-icon"></div>
              <div className="left-info-title">Online Validators</div>
            </div>
            <div className="right-value">{totalValidators}</div>
          </div>
          <div className="one-home-item middle-item">
            <div className="left-info">
              <div className="left-info-icon l-max-icon"></div>
              <div className="left-info-title">Max Supply</div>
            </div>
            <div className="right-value">{totalSupply}</div>
          </div>
          <div className="one-home-item">
            <div className="left-info">
              <div className="left-info-icon l-price-icon"></div>
              <div className="left-info-title">Current Price</div>
            </div>
            <div className="right-value">{price} $</div>
          </div>
        </div>
        <div className="line-info-holder">
            <div className="one-home-item">
              <div className="left-info">
                <div className="left-info-icon l-validators-icon"></div>
                <div className="left-info-title">Current Difficulty</div>
              </div>
              <div className="right-value">{difficulty}</div>
            </div>
          </div>
      </div>
      <div className="block-transfers-holder">
        <div className="inline-home home-left">
          <div className="header-with-icon">
            <div className="header-icon block-icon-header"></div>
            <div className="header-icon-title">Blocks</div>
            <Link to="/blocks/1">
              <div className="view-all">View All</div>
            </Link>
          </div>
          <div className="home-list-holder">
            {blocks.map((item, i) => (
              <BlockPreview block={item} key={i} />
            ))}
          </div>
        </div>
        <div className="inline-home home-right">
          <div className="header-with-icon">
            <div className="header-icon transfer-icon-header"></div>
            <div className="header-icon-title">Transfers</div>
            <Link to="/transfers/1">
              <div className="view-all">View All</div>
            </Link>
          </div>
          <div className="home-list-holder">
            {transfers.map((item, i) => (
              <TransferPreview transfer={item} key={i} />
            ))}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Home;
