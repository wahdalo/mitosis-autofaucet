import fetch from 'node-fetch';
import { Twisters } from "twisters";
const twisters = new Twisters();
import fs from "fs";

const cekEligibity = (address) => new Promise((resolve, reject) => {
    fetch(`https://api.expedition.mitosis.org/v1/faucet/${address}/eligibility`, {
        method: 'GET',
        headers: {
            'authority': 'api.expedition.mitosis.org',
            'Accept': `application/json, text/plain, */*`,
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://expedition.mitosis.org',
            'Referer': 'https://expedition.mitosis.org/',
            'Sec-Ch-Ua': `"Chromium";v="122", "Not(A:Brand";v="24", "Microsoft Edge";v="122"`,
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0'
        }
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err))
});

const getFaucet = (address) => new Promise((resolve, reject) => {
    fetch(`https://api.expedition.mitosis.org/v1/faucet/${address}`, {
        method: 'GET',
        headers: {
            'authority': 'api.expedition.mitosis.org',
            'Accept': `application/json, text/plain, */*`,
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://expedition.mitosis.org',
            'Referer': 'https://expedition.mitosis.org/',
            'Sec-Ch-Ua': `"Chromium";v="122", "Not(A:Brand";v="24", "Microsoft Edge";v="122"`,
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0'
        }
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err))
});

const processAccount = async (address) => {
    const checkAndUpdate = async () => {
        try {
            const eligGabang = await cekEligibity(address);
            const getFaucetnjerr = await getFaucet(address);
            const logClaim = await getFaucetnjerr.message
            if (eligGabang.status === 'ELIGIBLE'){
                twisters.put(address, {
                    text: `
Address : ${address}
Check : Claiming faucet
`,
                });
                const getFaucetnjerr = await getFaucet(address);
                const logClaim = await getFaucetnjerr.message
                twisters.put(address, {
                    text: `
Address : ${address}
Check : ${logClaim}
`,
                });
                twisters.put(address, {
                    active: false,
                    removed: true,
                    text: `
Address : ${address}
Check : ${logClaim}
`,
                });

                await checkAndUpdate();
                return;
            }

                twisters.put(address, {
                    text: `
Address : ${address}
Check : ${logClaim}
`,
                });
                setTimeout(checkAndUpdate, 10000);
        } catch (error) {
            console.log(error)
            twisters.put(address, {
                active: true,
                text: `
Address : ${address}
Status : Error processing account, please check logs for details.
`,
            });

            twisters.put(address, {
                removed: true,
            });
            await checkAndUpdate();
            return;
        }
    }
    await checkAndUpdate();
    return;
};

(async () => {
    const accountsData = fs
        .readFileSync("./address.txt", "utf-8")
        .split(/\r?\n/);
    const allPromise = [];
    const promises = accountsData.map(async (account) => {
        if (account) {
            const [address] = account.split(/\r?\n/);
            processAccount(address);
        }

    });
    for (const processAccount of promises) {
        allPromise.push(await processAccount);
    }
})()