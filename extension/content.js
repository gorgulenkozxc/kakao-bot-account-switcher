;(async () => {
	console.log('Content script loaded')
	await chrome.runtime.sendMessage({ command: 'GetCookies' }, (response) => {
		if (!response) {
			alert('No response')
			return
		}
		if (response.success) {
			alert('Done')
			return
		}
		if (response.error) {
			alert(response.error)
			return
		}
		console.log({ response })
		alert('check console')
	})
})()
