import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Table from "../components/Table";
import axiosHashInstance from "../api/axiosHashApi";

const TopHolders = () => {
  const headersTable = ["Rank", "Account ID", "Balance"];
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    getAccounts();
  }, []);

  const getAccounts = async () => {
    const response = await axiosHashInstance.get(`/accounts?=limit=100`);

    const data = response.data;

    const accounts = data.map((account) => {
      let bal = account.balance;
      let balances = parseFloat(bal.toString().replace(/,/g, ""));
      let base = balances / 1000000000000;
      let balance;
      let suffix;

      if (base >= 1000) {
        let kilo = base / 1000;
        if (kilo >= 1000) {
          let million = kilo / 1000;
          balance = million.toFixed(4);
          suffix = "MP3D";
        } else {
          balance = kilo.toFixed(4);
          suffix = "kP3D";
        }
      } else {
        balance = base.toFixed(4);
        suffix = "P3D";
      }

      return {
        accountId: account.accountId[0],
        balance: parseFloat(balance),
        suffix: suffix,
        originalBalance: parseInt(account.balance),
      };
    });

    accounts.sort((a, b) => {
      const suffixOrder = { P3D: 1, kP3D: 2, MP3D: 3 };
      const aVal = a.balance * Math.pow(10, suffixOrder[a.suffix] * 3);
      const bVal = b.balance * Math.pow(10, suffixOrder[b.suffix] * 3);
      return bVal - aVal;
    });

    setAccounts(accounts.slice(0, 100));
  };

  const prepareTableArray = (arr) => {
    if (!arr.length) {
      return [];
    }

    let array = [];
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      array.push([
        { val: i + 1 },
        {
          val: <Link to={`/account/${item.accountId}`}>{item.accountId}</Link>,
        },
        { val: item.balance.toFixed(4) + " " + item.suffix },
      ]);
    }

    return array;
  };

  return (
    <React.Fragment>
      <div className="page-title">TOP HOLDERS</div>
      <Table header={headersTable} array={prepareTableArray(accounts)} />
    </React.Fragment>
  );
};

export default TopHolders;
