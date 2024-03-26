const cds = require('@sap/cds');
const exp = require('express'); 
const xenv = require('@sap/xsenv');
// const hdbext = require('@sap/hdbext');
const axios = require('axios');
// const btoa = require('btoa');
const request = require('request');
const app = exp();
const { MatDataBPA } = cds.entities('com.mindset.vendorReq');
var sAccessToken;
var quizResponse;
//=============================================//
//=============== WF Start ====================//
//=============================================//

/**
 * Invoke the workflow api from UX app
 * @method POST
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */

async function readData(req, res) {
    let tokenurl = 'https://mindsetbtpdev.authentication.us10.hana.ondemand.com/oauth/token?grant_type=client_credentials&response_type=token';

    const username = 'sb-quizapp!t37789';
    const password = 'JssoxwDOnC+RWim626JN+umg3do=';
    var f;
    let basicAuth = 'Basic ' + btoa(username + ':' + password);
    await axios.get(tokenurl,{
        headers: {
            'Authorization': basicAuth,
            "Content-Type": "application/json;charset=UTF-8",
        }
    }).then(async (response) => {
        sAccessToken = response.data.access_token;
        await axios.get("https://mindset-consulting--llc-mindsetbtpdev-btp-dev-quizapp-srv.cfapps.us10.hana.ondemand.com/odata/v4/quiz/Quiz?$expand=questions", {
            headers: {
                'Authorization': "Bearer " + sAccessToken,
                "Content-Type": "application/json;charset=UTF-8",
            }
        }).then((response) => {
            f = response
        })
    }).catch(err => {
        console.log('err');
        return {};
    });
    quizResponse = f;
}

/**
 * Get the Bearer token and send to UX
 * @method Get
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */

async function postData (req, res) {
    let tokenurl = 'https://mindsetbtpdev.authentication.us10.hana.ondemand.com/oauth/token?grant_type=client_credentials&response_type=token';
    const username = 'sb-quizapp!t37789';
    const password = 'JssoxwDOnC+RWim626JN+umg3do=';
    console.log(typeof(req.data));
    var data = {
        title: req.data.title,
        endTime: req.data.endTime,
        date: req.data.date,
        noOfQues: req.data.noOfQues,
        fullMarks: req.data.fullMarks,
        passMarks: req.data.passMarks,
        learningSP: req.data.learningSP,
        learningEP: req.data.learningEP,
        draft: req.data.draft,
        questions: req.data.questions
    }
    let basicAuth = 'Basic ' + btoa(username + ':' + password);
    await axios.get(tokenurl,{
        headers: {
            'Authorization': basicAuth,
            "Content-Type": "application/json;charset=UTF-8",
        }
    }).then(async (response) => {
        req.headers.authorization = "Bearer " + response.data.access_token;
        return await axios.post("https://mindset-consulting--llc-mindsetbtpdev-btp-dev-quizapp-srv.cfapps.us10.hana.ondemand.com/odata/v4/quiz/Quiz", data, {
                headers: req.headers,
            }).then((response) => {
                return response
            })
    }).catch(err => {
        return err;
    });
}

async function patchData (req, res) {
    let tokenurl = 'https://mindsetbtpdev.authentication.us10.hana.ondemand.com/oauth/token?grant_type=client_credentials&response_type=token';
    const username = 'sb-quizapp!t37789';
    const password = 'JssoxwDOnC+RWim626JN+umg3do=';
    var data = {
        ID: req.data.ID,
        title: req.data.title,
        endTime: req.data.endTime,
        date: req.data.date,
        noOfQues: req.data.noOfQues,
        fullMarks: req.data.fullMarks,
        passMarks: req.data.passMarks,
        learningSP: req.data.learningSP,
        learningEP: req.data.learningEP,
        draft: req.data.draft
    }
    let basicAuth = 'Basic ' + btoa(username + ':' + password);
    await axios.get(tokenurl,{
        headers: {
            'Authorization': basicAuth,
            "Content-Type": "application/json;charset=UTF-8",
        }
    }).then(async (response) => {
        req.headers.authorization = "Bearer " + response.data.access_token;
        return await axios.patch(`https://mindset-consulting--llc-mindsetbtpdev-btp-dev-quizapp-srv.cfapps.us10.hana.ondemand.com/odata/v4/quiz/Quiz/${req.data.ID}`, data, {
                headers: req.headers,
            }).then((response) => {
                return response
            })
    }).catch(err => {
        return err;
    });
}

async function onReadData (req, res){
    await axios.get("https://mindset-consulting--llc-mindsetbtpdev-btp-dev-quizapp-srv.cfapps.us10.hana.ondemand.com/odata/v4/quiz/Quiz", {
        headers: req.headers
    }).then((response) => {
        return response
    })
}

async function afterReadData (req, res) {
    res.results = quizResponse.data.value;
}

async function onPostData (req, next) {
    return next(); 
}

async function afterPostData(req, res){

}

async function beforeDeleteData(req, res){
    let tokenurl = 'https://mindsetbtpdev.authentication.us10.hana.ondemand.com/oauth/token?grant_type=client_credentials&response_type=token';
    const username = 'sb-quizapp!t37789';
    const password = 'JssoxwDOnC+RWim626JN+umg3do=';
    let basicAuth = 'Basic ' + btoa(username + ':' + password);
    await axios.get(tokenurl,{
        headers: {
            'Authorization': basicAuth,
            "Content-Type": "application/json;charset=UTF-8",
        }
    }).then(async (response) => {
        req.headers.authorization = "Bearer " + response.data.access_token;
        // return await axios.delete(`https://mindset-consulting--llc-mindsetbtpdev-btp-dev-quizapp-srv.cfapps.us10.hana.ondemand.com/odata/v4/quiz/Quiz/${req.params[0]}`, {
        //         headers: req.headers,
        //     }).then((response, next) => {
        //         return response
        //     })
    }).catch(err => {
        return err;
    });
}

async function afterDeleteData(req, res){
    res.send();
}



module.exports = function (srv) {
    srv.before('READ', 'Quiz', readData);
    srv.after('READ', 'Quiz', afterReadData);
    srv.before('POST', "Quiz", postData);
    srv.after('POST', "Quiz", afterPostData);
    srv.on('POST', "Quiz", onPostData);
    srv.before('UPDATE', 'Quiz', patchData);
    srv.before('DELETE', 'Quiz', beforeDeleteData);
    // srv.after('DELETE', 'Quiz', afterDeleteData);
};
