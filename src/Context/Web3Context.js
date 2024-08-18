import React from "react";
import { Server, Keypair, TransactionBuilder, Networks, Operation } from "stellar-sdk";
import { rpcUrl, vrtContractId, daoContractId } from "../Constants/config";

// Initialize the Stellar server
const server = new Server(rpcUrl);

// Initial State
const initialState = {
  account: "",
  vrtContract: vrtContractId,
  daoContract: daoContractId,
  position: "GUEST",
};

const StellarContext = React.createContext({
  ...initialState,
});

export const StellarProvider = ({ children }) => {
  const [data, setData] = React.useState({ ...initialState });

  React.useEffect(() => {}, []);

  const walletConnect = async () => {
    try {
      const pair = Keypair.fromSecret("<Your Secret Key>"); // Replace with dynamic secret key handling
      setData({ ...data, account: pair.publicKey() });

      // Call a method to determine the user's position based on the contract logic
      await getPosition(pair.publicKey());

    } catch (error) {
      console.error("Error connecting to Stellar wallet:", error);
    }
  };

  const getPosition = async (publicKey) => {
    // Logic to interact with the Stellar contracts and determine the user's position
    const vrtBalance = await server.loadAccount(publicKey).then(account => {
      // Retrieve VRT balance from account balances (assuming it's a token on Stellar)
      const vrtBalanceObj = account.balances.find(balance => balance.asset_code === "VRT");
      return vrtBalanceObj ? parseFloat(vrtBalanceObj.balance) : 0;
    });

    // Assume you have stored contract data in a way compatible with Stellar
    const daoContractOwner = await fetchDaoContractOwner(); // Implement this based on your contract

    if (publicKey === daoContractOwner) {
      setData({
        ...data,
        position: "OWNER",
      });
    } else {
      if (vrtBalance > 0) {
        setData({
          ...data,
          position: "MEMBER",
        });
      } else {
        setData({
          ...data,
          position: "GUEST",
        });
      }
    }
  };

  return (
    <StellarContext.Provider value={{ ...data, walletConnect }}>
      {children}
    </StellarContext.Provider>
  );
};

export default StellarContext;
