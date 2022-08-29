import React from 'react'
import getWeb3 from './getWeb3'
import getContract from './getContract'
import Inventory from '../build/contracts/SpaceOzInventory.json'
import SpaceOzToken from '../build/contracts/SpaceOzToken.json'
import { metadata } from '../pages'
import BigNumber from 'bignumber.js'
import { toast } from 'react-toastify'
import Web3 from 'web3'

const InventoryAddress = '0x15A823c8D1B29Bbd778CEc51cE3F81dAe68E88B1'
const SpaceOzTokenAddress = '0x5a902c6BDe2D2d9bdb6FF70cDC0b30e7d94F6943'

let web3, accounts, inventory, token;

const errorMsg = (message) => {
    toast.error(message);
}

const successMsg = (message) => {
    toast.success(message);
}

async function initializeWeb3() {
    try {

        const _web3 = await getWeb3()
        const _accounts = await _web3.eth.getAccounts()

        const _inventory = await getContract(_web3, Inventory, InventoryAddress)
        const _token = await getContract(_web3, SpaceOzToken, SpaceOzTokenAddress)


        web3 = _web3;
        accounts = _accounts;
        inventory = _inventory;
        token = _token;
        return ({ web3, accounts, inventory, token })
    } catch (error) {
        errorMsg(
            `Failed to load web3, accounts, or contract. Check console for details.`
        )
        console.log(error)
    }
}

async function changeAccount(callback) {
    console.log('change account')
    window.ethereum.on('accountsChanged', function (_accounts) {
        // Time to reload your interface with accounts[0]!
        callback(_accounts)
    })
}

async function getTokenBalance() {
    try {

        var nativeBalance = web3.utils.fromWei(await web3.eth.getBalance(accounts[0]));
        var tokenBalance = await token.methods.balanceOf(accounts[0]).call()
        return { nativeBalance, tokenBalance }
    } catch (error) {
        errorMsg(error?.message ?? error)
    }
}

async function mint(token_id, price) {
    console.log('mint')
    successMsg('Transaction Started')
    try {
        await inventory.methods.mint(
            token_id).send({ from: accounts[0], value: BigNumber(price) })
        successMsg('Transaction Successfully')
    } catch (error) {
        errorMsg(error?.data?.message ?? error.message)
    }
}


async function mintWithToken(token_id) {
    successMsg('Transaction Started')
    try {
        console.log("mint with token")
        await inventory.methods.mint(
            token_id).send({ from: accounts[0] })
        successMsg('Transaction Successfully')

    } catch (error) {
        errorMsg(error?.data?.message ?? error.message)
    }
}

async function mintToken(val) {
    const privateKey = process.env.NEXT_PUBLIC_ADMIN_PRIVATE_KEY;
    const admin = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    web3.eth.accounts.wallet.add(admin);

    await token.methods.mint(accounts[0], val).send({ from: admin.address, gasLimit: 71275, gasPrice: web3.utils.toWei('40', 'gwei') }).catch(error => {
        console.log(error)
    })

}

async function getContractData() {
    var events = await inventory.getPastEvents('TransferSingle', { fromBlock: 0, toBlock: 'latest' })
    return events;
}

const mint_by_owner = async () => {
    console.log('mint by owner')
    for (let index = 0; index < metadata.length; index++) {
        var ship = metadata[index];
        if (ship.id == index + 1) {
            console.log('minting ship', ship.id)
            var transaction = await inventory.methods.mint(
                BigNumber(ship.price.toString()).toString(),
                ship.priceSPZ.toString()).send({ from: accounts[0] })
            console.log(transaction)
        }
    }
}


export {
    initializeWeb3,
    mint,
    mintWithToken,
    changeAccount,
    getTokenBalance,
    mint_by_owner,
    getContractData,
    accounts,
    mintToken
}