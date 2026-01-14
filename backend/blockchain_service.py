# backend/blockchain_service.py
"""
Blockchain Bridge Service - Connects Gemini AI to AcaWise Smart Contract
"""

from web3 import Web3
from eth_account import Account
import json
import os
from dotenv import load_dotenv

load_dotenv()

class BlockchainBridge:
    def __init__(self):
        self.rpc_url = os.getenv("RPC_URL", "https://rpc.sepolia.mantle.xyz")
        self.contract_address = os.getenv("CONTRACT_ADDRESS")
        self.private_key = os.getenv("BLOCKCHAIN_PRIVATE_KEY")
        
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        
        if not self.w3.is_connected():
            print("⚠️  Warning: Not connected to blockchain")
            self.enabled = False
            return
        
        print(f"✅ Connected to blockchain: {self.rpc_url}")
        self.enabled = True
        
        # Load ABI
        try:
            with open('contract_abi.json', 'r') as f:
                self.contract_abi = json.load(f)
        except:
            print("⚠️  Warning: contract_abi.json not found")
            self.enabled = False
            return
        
        if self.private_key:
            self.account = Account.from_key(self.private_key)
            print(f"📍 Using account: {self.account.address}")
        else:
            print("⚠️  Warning: No private key found")
            self.enabled = False
            return
        
        if self.contract_address:
            self.contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(self.contract_address),
                abi=self.contract_abi
            )
            print(f"📜 Contract loaded: {self.contract_address}")
        else:
            print("⚠️  Warning: No contract address found")
            self.enabled = False
    
    def verify_research_on_chain(self, research_id: int, quality_score: int):
        if not self.enabled:
            print("⚠️  Blockchain not enabled, skipping")
            return {"status": "skipped", "reason": "blockchain_disabled"}
        
        try:
            quality_score = max(0, min(100, quality_score))
            print(f"📤 Verifying research #{research_id} with score {quality_score}...")
            
            nonce = self.w3.eth.get_transaction_count(self.account.address)
            
            transaction = self.contract.functions.verifyResearch(
                research_id, quality_score
            ).build_transaction({
                'from': self.account.address,
                'nonce': nonce,
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(
                transaction, private_key=self.private_key
            )
            
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            print(f"⏳ Transaction sent: {tx_hash.hex()}")
            
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            if receipt['status'] == 1:
                print(f"✅ Research verified on-chain! Block: {receipt['blockNumber']}")
                return {
                    "status": "success",
                    "tx_hash": tx_hash.hex(),
                    "block": receipt['blockNumber'],
                    "research_id": research_id,
                    "quality_score": quality_score
                }
            else:
                return {"status": "failed", "tx_hash": tx_hash.hex()}
                
        except Exception as e:
            print(f"❌ Error: {e}")
            return {"status": "error", "error": str(e)}
    
    def grade_code_on_chain(self, code_id: int, ai_score: int):
        if not self.enabled:
            print("⚠️  Blockchain not enabled, skipping")
            return {"status": "skipped", "reason": "blockchain_disabled"}
        
        try:
            ai_score = max(0, min(100, ai_score))
            print(f"📤 Grading code #{code_id} with score {ai_score}...")
            
            nonce = self.w3.eth.get_transaction_count(self.account.address)
            
            transaction = self.contract.functions.gradeCode(
                code_id, ai_score
            ).build_transaction({
                'from': self.account.address,
                'nonce': nonce,
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(
                transaction, private_key=self.private_key
            )
            
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            print(f"⏳ Transaction sent: {tx_hash.hex()}")
            
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            if receipt['status'] == 1:
                print(f"✅ Code graded on-chain! Block: {receipt['blockNumber']}")
                return {
                    "status": "success",
                    "tx_hash": tx_hash.hex(),
                    "block": receipt['blockNumber'],
                    "code_id": code_id,
                    "ai_score": ai_score
                }
            else:
                return {"status": "failed", "tx_hash": tx_hash.hex()}
                
        except Exception as e:
            print(f"❌ Error: {e}")
            return {"status": "error", "error": str(e)}
    
    def get_platform_stats(self):
        if not self.enabled:
            return None
        
        try:
            stats = self.contract.functions.getPlatformStats().call()
            return {
                "total_users": stats[0],
                "total_research": stats[1],
                "total_code": stats[2],
                "total_ai_verifications": stats[3]
            }
        except Exception as e:
            print(f"❌ Error getting stats: {e}")
            return None

# Global instance
blockchain_bridge = BlockchainBridge()

def verify_research(research_id: int, quality_score: int):
    return blockchain_bridge.verify_research_on_chain(research_id, quality_score)

def grade_code(code_id: int, ai_score: int):
    return blockchain_bridge.grade_code_on_chain(code_id, ai_score)