const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

module.exports = function (app) {
    console.log('initializing the app registration handler');
   
    //App registration
    app.post('/d24AppRegistration', (req, res) => {
        let data = req.body;
      
        //Start call create contact
        createContact(data.contact).then((respone) => {
            
            const contactID = respone.data.result;
            if (contactID != null || contactID != '') {
                //Start call create deal
                createDeal(data.deal, contactID).then((res) => {
                    console.log(res)
                    const dealID = res.data.result;
                    if (dealID != null || dealID != '') {
                        //Start attach product to deal
                        attachDealProduct(data.product, dealID).then((res) => {

                            console.log(res);
                            //redirect to checkout page
                            checkouctSession(data.product);

                        }).catch((exception) => {
                            console.log(exception);
                        })//End attach product in deal  
                        
                    }
                }).catch((exception) => {
                    console.log(exception);
                })//End call create deal                
            }

        }).catch((exception) => {
            console.log(exception);
        })//End call create contact
    })// end App registration
}//end module.export function


//Start create deal function
function createDeal(deal, contactID) {

    let url = getWebhookUrl(process.env.B24_INSTANCE_WEBHOOK_URL, 'crm.deal.add.json');

    return axios.post(url,
        {
            fields: {
                // "TITLE": "D24ChatBoat_3222",
                // "CONTACT_ID":"1",
                // "CATEGORY_ID": "118",
                // "UF_CRM_1626237018693": "Instance anand"
               

                "TITLE": "D24ChatBoat_" + contactID,
                "CONTACT_ID":contactID,
                "CATEGORY_ID": "118",
                "UF_CRM_1626237018693": deal.url,
                // "STAGE_ID": "NEW",

            }, params: { "REGISTER_SONET_EVENT": "Y" }
        }
    );

}//End creat deal function


//Start attach product in deal function
function attachDealProduct(product, dealID) {
    
    let url = getWebhookUrl(process.env.B24_INSTANCE_WEBHOOK_URL, 'crm.deal.productrows.set.json');

    const id=dealID;
    return axios.post(url,
        {
            id: dealID,
            rows:
                [
                    { "PRODUCT_ID": product.id, "QUANTITY": 1 }
                ]
        }


        // {
           
        //     id: 182, 
        //     rows:
        //     [ 
        //         { "PRODUCT_ID": 510, "PRICE": 100.00, "QUANTITY": 1 }
               
        //     ] 
        // }
    );

}//End attach product in deal function

//Start create contact function
function createContact(contact) {
    let url = getWebhookUrl(process.env.B24_INSTANCE_WEBHOOK_URL, 'crm.contact.add.json');

    return axios.post(url,
        {
            fields: {
                NAME: contact.firstName,
                LAST_NAME: contact.lastName,
                "OPENED": "Y",
                "ASSIGNED_BY_ID": 1,
                "TYPE_ID": "CLIENT",
                "SOURCE_ID": "SELF",
                "PHONE": [{ "VALUE": contact.mobile, "VALUE_TYPE": "WORK" }],
                "EMAIL": [{ "VALUE": contact.email, "VALUE_TYPE": "WORK" }]
            }, params: { "REGISTER_SONET_EVENT": "Y" }
        }
    );
}//End create contact function

function checkoutSession({price_id})
{
    let url = `${process.env.DOMAIN}/create-checkout-session` ;
    return axios.post(url,
    {
        "priceId": price_id
    });
}

//Returns the webhook url
function getWebhookUrl(webHookUrl, methodName) {
    let url = `${webHookUrl}/${methodName}`;
    console.log(`webhookurl: ${url}`);
    return url;
};