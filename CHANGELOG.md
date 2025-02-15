# Changelog  

All notable changes to this project will be documented in this file.  

---

## [1.0.0] - Initial Release (Two Years Ago)  
Open-source version provided to the 3DPass team.  

### 3DPass Block Explorer - Frontend  
- High-performance Web3 blockchain explorer client for The Ledger of Things.  
- Compatible with Substrate-based blockchain networks.  
- Connects to the 3DPscan Explorer API backend server directly from the user's web browser.  

### Features  
- Display of blocks, extrinsics, and events in detail.  
- Network summary dashboard for real-time blockchain statistics.  
- Integrated search bar for easy navigation.  

**Block Explorer Web Page:** was at [https://explorer.3dpass.org](https://explorer.3dpass.org)  //Deprecetaed

---

## [2.0.0] - Transition to Proprietary Ownership  

    - The project became proprietary, and a complete redesign of the block explorer was implemented.  
## New Domain for the Explorer 
  - **Block Explorer Web Page:** [https://3dpscan.io](https://3dpscan.io)

### New Features  
1. **Transaction Hash Search**  
   - Added a feature to search by transaction hash for detailed transaction information.  

2. **Top Holders List**  
   - Introduced a ranked list displaying the top holders on the network.  

3. **3D Object View and Render**  
   - Implemented a method to retrieve and render 3D objects inherent to certain blocks.  
   - Supported fetching of 3D objects using the `poscan_getMiningObject` method from the blockchain.  

**API Example:**  
```bash
curl -H "Content-Type: application/json" -d '{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "poscan_getMiningObject",
  "params": ["0x1e76d5f98d8a6047e6a2a7c999dd362cc62b3413b602c857917f3913e69b7c7e"]
}' http://localhost:9933/
```

## [2.1.0] - January 2025
New features and improvements focused on transaction details and custom standards.

### New Features
1. **Support for 3DPRC-2 Object Tokenization Standard**
  - Added the ability to search and display transactions related to the 3DPRC-2 object tokenization standard.

2. **Asset ID Tracking**
   - Displayed the status of Asset Id in the wallet.
   - Provided direct navigation to token details using Asset Id.
   - More details available at 3DPass Assets.

3. **Bounty History**
   - Introduced a new section that lists all bounties, both active and completed, for transparency and tracking purposes.

