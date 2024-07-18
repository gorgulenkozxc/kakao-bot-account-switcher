const secret = 'Bafee645a7f9000637f1545302e1e61148bd0e782a94e393f8a79364c76320547'

chrome.webRequest.onHeadersReceived.addListener(
	(details) => {
		for (let i = 0; i < details.responseHeaders.length; i++) {
			if (details.responseHeaders[i].name.toLowerCase() === 'content-security-policy') {
				details.responseHeaders.splice(i, 1)
				break
			}
		}
		return { responseHeaders: details.responseHeaders }
	},
	{
		urls: ['*://page.kakao.com/*'],
		types: ['main_frame', 'sub_frame'],
	},
	['responseHeaders']
)

chrome.action.onClicked.addListener((tab) => {
	if (tab.url.includes('page.kakao.com')) {
		chrome.scripting.executeScript({
			target: { tabId: tab.id },
			files: ['content.js'],
		})
	}
})

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
	if (message.command === 'GetCookies') {
		;(async () => {
			const cookies = await new Promise((resolve) => {
				chrome.cookies.getAll({ domain: '.kakao.com' }, (cookie) => resolve(cookie))
			})

			console.log({ cookies })

			const res = await fetch('http://localhost:7900/cookies', {
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
