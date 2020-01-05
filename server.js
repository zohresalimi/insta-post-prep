const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const path = require("path")
const isProduction = process.env.NODE_ENV === "production"
const port = isProduction ? 8080 : 3000

const { processProduct } = require("./main")

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static("view"))

app.get("/", (request, response) => {
	response.sendFile(path.resolve("view/index.html"))
})

app.post("/process", async (req, res) => {
	const responseJson = {}
	var productDetail = await processProduct(req.body.url).catch(error => {
		responseJson.status = false
		responseJson.data = error
	})

	if (!productDetail) {
		responseJson.status = false
		responseJson.data = "Could not find product"
	} else {
		responseJson.status = true
		responseJson.data = productDetail
	}

	res.json(responseJson)
})

app.listen(port, () => console.log(`App listening on port ${port}!`))
