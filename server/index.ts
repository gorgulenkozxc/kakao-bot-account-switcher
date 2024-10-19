import bodyParser from 'body-parser'
import express from 'express'
import mysql from 'mysql2/promise'
import 'dotenv/config'

const app = express()
const port = process.env.PORT || 7900
const pool = await mysql.createConnection({
	host: process.env.MYSQL_HOST,
	port: +(process.env.MYSQL_PORT as string),
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASS,
	database: process.env.MYSQL_DB,
  enableKeepAlive: true,
  maxIdle: 0,
  idleTimeout: 60000
})

app.use(bodyParser.json())

const cookiesKeyRequired = {
	_kaslt: true,
	_kpwtkn: true,
	_kawlt: true,
	_kpawbat: false,
	_kpdid: false,
	_kpiid: false,
	_kawltea: false,
	_karmt: false,
	_karmtea: false,
	_kahai: false,
	_kau: false,
}
const cookiesKeys = new Set(Object.keys(cookiesKeyRequired))
app.post('/cookies', async (req, res) => {
	try {
		const { cookies: cookiesRaw, secret } = req.body as {
			cookies: { name: string; value: string }[]
			secret: string
		}
		if (
			secret !==
			'afee645a7f9000637f1545302e1e61148bd0e782a94e393f8a79364c76320547'
		) {
			// await new Promise((resolve) => setTimeout(resolve, 3000))
			res.status(403).json({ message: 'Invalid secret' })
			return
		}

		// const validCookieRegex =
		// 	/_kaslt|_kpwtkn|_kawlt|_kpawbat|_kpdid|_kpiid|_kawltea|_karmt|_karmtea|_kahai|_kau/g

		const validCookies = cookiesRaw.filter((cookie) =>
			cookiesKeys.has(cookie.name),
		)

		// if (
		// 	validCookies.filter(
		// 		(cookie) =>
		// 			cookiesKeyRequired[cookie.name as keyof typeof cookiesKeyRequired],
		// 	).length !== Object.values(cookiesKeyRequired).filter(Boolean).length
		// ) {
		// 	res.status(403).json({ message: 'Not all required cookies are present' })
		// 	return
		// }

		console.log({ validCookies })

		const [rows, fields] = await pool.query(
			'SELECT * FROM kakao._cookies WHERE ( ID = "dit" )',
		)
		// biome-ignore lint/suspicious/noExplicitAny:
		const oldCookie = (rows as [any])[0]
		const newCookie = oldCookie

		if (!oldCookie || !Object.keys(oldCookie).length) {
			return res.status(500).json({
				message: `Server could not find previous cookie (problem with mysql): ${rows}`,
			})
		}

		for (const cookie of validCookies) {
			if (Object.keys(newCookie).includes(cookie.name)) {
				newCookie[cookie.name] = cookie.value
			}
		}

		newCookie.ID = 'dit'
		await pool.query(
			`UPDATE kakao._cookies SET ID = "dit_${Math.random().toString(36).slice(2)}_${new Date().getTime()}" WHERE ( ID = "dit" )`,
		)
		await pool.query(
			`INSERT INTO kakao._cookies (${Object.keys(newCookie).join(',')}) VALUES (${Object.values(
				newCookie,
			)
				.map((value) => `'${encodeURIComponent(decodeURIComponent(decodeURIComponent(value as string)))}'`)
				.join(',')})`,
		)
		res.send('ok')

		res.sendStatus(200)
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: e })
	}
})

app.listen(port, () => console.log(`Server started on port ${port}`))
