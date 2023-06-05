const xlsx = require('xlsx');
const fs = require('fs');
const json2xls = require('json2xls');
// const PdfReader = require('pdfreader');
const pdf = require('pdf-parse');

function readPdfData(req,res){

    let files = req.file;
    const fileName = `${req.file.destination}/${req.file.filename}`;
    if (files) {
        let dataBuffer = fs.readFileSync(fileName);
        pdf(dataBuffer).then(function (data) {
            const info=data.text.split('\n',)
            res.status(200).send({ status: true, data: info })
        });
    }else{
        res.status(400).send({ status:false, message:"please upload pdf"})
    }
}

function readExcelData (req, res) {
    const fileName = `${req.file.destination}/${req.file.filename}`;
    // console.log('fileName', fileName);
    const workbook = xlsx.readFile(fileName); 
    let workbook_sheet = workbook.SheetNames; 
    let workbook_response = xlsx.utils.sheet_to_json( 
        workbook.Sheets[workbook_sheet[0]]
    );
    console.log('workbook_response.length', workbook_response.length);
    if (workbook_response[0].Price) {
    for(let i = 0; i < workbook_response.length ; i++) {
        console.log('Price',workbook_response[i].Price)
        workbook_response[i].Discounted_price = 
        workbook_response[i].Price - (
            (workbook_response[i].Price / 100) * workbook_response[i].Concession
        )
        workbook_response[i].Salary = 15000;
    }
        // console.log('workbook_sheet',workbook_response[i].Discounted_price)
    } 
    const data = json2xls(workbook_response);
    fs.writeFileSync(`./Backup/${req.file.filename}`, data, 'binary', (err) => {
        if (err) console.log(err);
        else console.log('success')
    })
    res.status(200).send(workbook_response)
}

module.exports = {readPdfData,readExcelData}