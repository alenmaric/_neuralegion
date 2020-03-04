const express = require('express');
const fs = require('fs');
const router = express.Router();
var AdmZip = require('adm-zip');
const dbconnection = require('./../dataaccess/dbcontext');
const dbquery = require('./../dataaccess/query');
const multer = require('multer');

//const upload = multer({ dest: 'projects/' });

const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './projects');
    },
    filename: function(req, file, callback) {

        callback(null, (Math.floor(Date.now() / 1000) + '.' + file.originalname.split('.').pop()));
        //callback(null, file.filename);
    }
});

const fileFilter = (request, file, callback) => {
    if(file.mimetype === 'application/x-zip-compressed') {
        callback(null, true);
    } else {
        callback(new Error('File extension is not supported'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});


var lamdas = require('./../models/lamda.js');



router.get('/:pageNumber/:pageSize', async  (request, response) => {

    let pageSize = request.params.pageSize;
    let pageNumber = request.params.pageNumber;

    if(pageNumber == null ) pageNumber = 5;


    var queryGet = `SELECT * FROM lambda LIMIT ${pageSize} OFFSET ${pageNumber}`;

    var resultsGet;
    try {
        resultsGet =  await dbquery(dbconnection, queryGet);

    } catch (error) {

        return response.status(500).json({message: error});
    }


    var queryCount = `SELECT count(id) as count FROM lambda`;

    const resultsCount =  await dbquery(dbconnection, queryCount);

    const result = {result: resultsGet, totalItems: resultsCount[0].count};

    response.json(result);
});


router.post('/triggerlambda/:trigger',  async (request, response) => {


    var query = `SELECT * FROM lambda WHERE MATCH(_trigger) AGAINST ("%${request.params.trigger}%" IN NATURAL LANGUAGE MODE);`;
    const results =  await dbquery(dbconnection, query);

    if(results.length <= 0)
        return response.status(400).json({msg: "Lambda not found"})


    const result = results[0];

    const lambdaProject = require('./../projects/' + result.name + '/' + result.handler);

    var lambdaResult;

    try {

        lambdaResult = lambdaProject[result.handler](request.body);
    } catch (error) {

        return response.status(500).json({message: error});
    }

    var query = `UPDATE lambda SET invocations = invocations + 1 WHERE id = ${result.id}`;
    dbquery(dbconnection, query);

    response.status(200).json({data: lambdaResult});
});

router.post('/',  async (request, response) => {

    var query = `INSERT INTO lambda (projectpath, name, handler, _trigger) VALUES ('/test/path/', '${request.body.name}', '${request.body.handler}', '${request.body._trigger}')`;

    try {
        const results =  await dbquery(dbconnection, query);

        response.status(200).json({data: results.insertId});
    } catch (error) {

        response.status(500).json({data: error});
    }



});

router.post('/uploadfile', upload.single('file') ,async (request, response) => {

    var zip = new AdmZip(request.file.path);

    zip.extractAllTo("./projects", true);

    var query = "INSERT INTO lambda (projectpath, name, handler, _trigger) VALUES ('projects/"+request.file.filename+"', '"+request.body.name+"', '"+request.body.handler+"', '"+request.body._trigger+"')";

    try {
        const results =  await dbquery(dbconnection, query);

        response.status(200).json({data: results.insertId});
    } catch (error) {

        response.status(500).json({data: error});
    }

});

router.post('/removelambdas', async (request, response) => {

    var query;

    try {
        request.body.forEach(element => {
            query = `DELETE FROM lambda WHERE id = ${element};`;
            dbquery(dbconnection, query);
        });

        response.status(200).json({data: "Successfully deleted"});
    } catch (error) {
        response.status(500).json({data: error});
    }

});

module.exports = router;