const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const port = 3000
const path = require("path")

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

	console.log(productDetail)

	if (!productDetail) {
		responseJson.status = false
		responseJson.data = "Could not find product"
	} else {
		responseJson.status = true
		responseJson.data = productDetail
	}

	res.json(responseJson)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
